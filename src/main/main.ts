/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-plusplus */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import IracingClient from 'node-irsdk-2021';
import io from 'socket.io-client';
import axios from 'axios';
import settings from 'electron-settings';
import { Connection } from 'types/interfaces';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

console.log(`Setting File: ${settings.file()}`);

const Iracing = IracingClient.getInstance();
const Streaming = io('https://streaming.gabirmotors.com');

let hasCompletedSetup = false;
let connection: Connection = 'connecting';
const checkSettings = async () => {
    hasCompletedSetup = await settings.has('channel');

    if (hasCompletedSetup) {
        options.channel = (await settings.get('channel')) as string;
        options.isStreamer = (await settings.get('isStreamer')) as boolean;
    }
};

const options = {
    updateInterval: 1000,
    sessionNum: 0,
    channel: '',
    isStreamer: true,
};

let sessionRacers = [];
let sessionInfo = {
    flags: [],
    session: {
        number: 0,
        type: 'PRACTICE',
        timeRemaining: 0,
        fastRepairs: 0,
        fastestLap: null,
    },
    track: {
        name: 'Unknown Track',
        id: -1,
        city: 'Unknown City',
        country: 'Unknown Country',
        temperature: 'N/A',
        length: 'N/A',
    },
    weather: {
        windSpeed: 'N/A',
        temperature: 'N/A',
        skies: 'Sunny',
    },
};

let driverData = {
    tiresRemaining: {
        left: { front: 0, rear: 0 },
        right: { front: 0, rear: 0 },
    },
    fuel: { remaining: 0, percent: 0 },
};

checkSettings();
export default class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//   require('electron-debug')();
// }

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload
        )
        .catch(console.log);
};

const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        autoHideMenuBar: true,
        backgroundColor: '#222222',
        frame: false,
        webPreferences: {
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
        let authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
        });
        const authUrl =
            'https://id.twitch.tv/oauth2/authorize?client_id=6gfpjegdkmcmepffbvh4vfp8s9vd13&redirect_uri=https://gabirmotors.com/vote&response_type=token+id_token&scope=user:read:email+openid&claims={ "id_token": { "email": null, "email_verified": null }, "userinfo": { "picture": null, "email": null, "preferred_username": null } }';
        ipcMain.on('ipc-example', async (event, args) => {
            console.log(args);

            switch (args[0]) {
                case 'restart_app':
                    autoUpdater.quitAndInstall();
                    break;
                case 'close':
                    app.quit();
                    break;
                case 'minimize':
                    mainWindow.minimize();
                    break;
                case 'maximize':
                    if (mainWindow.isMaximized()) {
                        mainWindow.unmaximize();
                    } else {
                        mainWindow.maximize();
                    }
                    break;
                case 'twitch_auth':
                    if (authWindow) {
                        authWindow.loadURL(authUrl);
                        authWindow.show();

                        event.reply('auth_window_opened', true);
                    }
                    break;
                case 'setup_name':
                    await settings.set('channel', args[1]);
                    await settings.set('isStreamer', false);

                    // eslint-disable-next-line prefer-destructuring
                    options.channel = args[1];
                    options.isStreamer = false;

                    hasCompletedSetup = true;
                    mainWindow.webContents.send(
                        'setup_complete',
                        hasCompletedSetup
                    );
                    mainWindow.webContents.send('user_data', options);
                    break;
                case 'app_version':
                    event.sender.send('app_version', {
                        version: app.getVersion(),
                    });
                    break;
                default:
                    break;
            }
        });

        // 'will-navigate' is an event emitted when the window.location changes
        // newUrl should contain the tokens you need
        authWindow.webContents.on(
            'will-navigate',
            async function (event, newUrl) {
                const token = newUrl.split('access_token=')[1].split('&id')[0];
                console.log(`Stuff: ${token}`);

                const userRes = await axios.get(
                    'https://id.twitch.tv/oauth2/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const userData = userRes.data;
                console.log(userData);

                authWindow.hide();

                await settings.set('channel', userData.preferred_username);
                await settings.set('isStreamer', true);

                options.channel = userData.preferred_username;
                options.isStreamer = true;

                hasCompletedSetup = true;
                mainWindow.webContents.send(
                    'setup_complete',
                    hasCompletedSetup
                );
                mainWindow.webContents.send('user_data', options);
            }
        );

        authWindow.on('closed', function () {
            authWindow = null;
        });

        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }

        if (mainWindow) {
            mainWindow.webContents.send('setup_complete', hasCompletedSetup);
            if (hasCompletedSetup) {
                mainWindow.webContents.send('user_data', options);
            }
        }

        Iracing.on('SessionInfo', (evt) => {
            if (connection !== 'connected') {
                connection = 'connected';
                mainWindow.webContents.send('connection', connection);
            }
            const drivers = evt.data.DriverInfo.Drivers;

            sessionInfo.session.type =
                evt.data.SessionInfo.Sessions[
                    sessionInfo.session.number
                ].SessionName;
            sessionInfo.session.fastRepairs =
                evt.data.WeekendInfo.WeekendOptions.FastRepairsLimit;
            sessionInfo.session.fastestLap =
                evt.data.SessionInfo.Sessions[
                    sessionInfo.session.number
                ].ResultsFastestLap;
            sessionInfo.track = {
                name: evt.data.WeekendInfo.TrackDisplayName,
                id: evt.data.WeekendInfo.TrackID,
                city: evt.data.WeekendInfo.TrackCity,
                country: evt.data.WeekendInfo.TrackCountry,
                temperature: evt.data.WeekendInfo.TrackSurfaceTemp,
                length: evt.data.WeekendInfo.TrackLengthOfficial,
            };
            sessionInfo.weather = {
                windSpeed: evt.data.WeekendInfo.TrackWindVel,
                temperature: evt.data.WeekendInfo.TrackAirTemp,
                skies: evt.data.WeekendInfo.TrackSkies,
            };

            sessionRacers = [];

            for (let i = 0; i < drivers.length - 1; i++) {
                const driver = drivers[i];

                if (!driver.CarIsPaceCar) {
                    sessionRacers.push({
                        carIndex: driver.CarIdx,
                        name: driver.UserName,
                        userID: driver.UserID,
                        carNumber: driver.CarNumber,
                        classID: driver.CarClassID,
                        isPaceCar: driver.CarIsPaceCar === 1,
                        raceData: {
                            position: 0,
                            onPitRoad: true,
                            class: 0,
                            f2Time: 0,
                            lap: 0,
                            lapsCompleted: 0,
                            fastRepairsUsed: 0,
                            lapPercent: 0,
                        },
                        carData: {
                            trackSurface: 'OnTrack',
                            steer: 0,
                            rpm: 0,
                            gear: 0,
                        },
                        lapTimes: {
                            last: 0,
                            best: {
                                time: 0,
                                lap: 0,
                            },
                        },
                        flags: [],
                    });
                }
            }

            if (mainWindow) {
                mainWindow.webContents.send('session_update', {
                    info: sessionInfo,
                });
            }
        });

        Iracing.on('Telemetry', (evt) => {
            if (connection !== 'connected' && mainWindow) {
                connection = 'connected';
                mainWindow.webContents.send('connection', connection);
            }

            options.sessionNum = evt.values.SessionNum;
            sessionInfo = {
                flags: evt.values.SessionFlags,
                session: {
                    number: evt.values.SessionNum,
                    type: sessionInfo.session.type,
                    timeRemaining: evt.values.SessionTimeRemain,
                    fastRepairs: sessionInfo.session.fastRepairs,
                    fastestLap: sessionInfo.session.fastestLap,
                },
                track: sessionInfo.track,
                weather: sessionInfo.weather,
            };

            for (let i = 0; i < sessionRacers.length; i++) {
                const _idx = sessionRacers[i].carIndex;
                sessionRacers[i].raceData.position =
                    evt.values.CarIdxPosition[_idx];
                sessionRacers[i].raceData.onPitRoad =
                    evt.values.CarIdxOnPitRoad[_idx];
                sessionRacers[i].raceData.f2Time =
                    evt.values.CarIdxF2Time[_idx];
                sessionRacers[i].raceData.lap = evt.values.CarIdxLap[_idx];
                sessionRacers[i].raceData.lapsCompleted =
                    evt.values.CarIdxLapCompleted[_idx];
                sessionRacers[i].raceData.class = evt.values.CarIdxClass[_idx];
                sessionRacers[i].carData.trackSurface =
                    evt.values.CarIdxTrackSurface[_idx];
                sessionRacers[i].carData.steer = evt.values.CarIdxSteer[_idx];
                sessionRacers[i].carData.rpm = evt.values.CarIdxRPM[_idx];
                sessionRacers[i].carData.gear = evt.values.CarIdxGear[_idx];
                sessionRacers[i].lapTimes.last =
                    evt.values.CarIdxLastLapTime[_idx];
                sessionRacers[i].lapTimes.best.time =
                    evt.values.CarIdxBestLapTime[_idx];
                sessionRacers[i].lapTimes.best.lap =
                    evt.values.CarIdxBestLapNum[_idx];
                sessionRacers[i].flags = evt.values.CarIdxSessionFlags[_idx];
                sessionRacers[i].raceData.fastRepairsUsed =
                    evt.values.CarIdxFastRepairsUsed[_idx];
                sessionRacers[i].raceData.lapPercent =
                    evt.values.CarIdxLapDistPct[_idx];
            }

            driverData = {
                tiresRemaining: {
                    left: {
                        front: evt.values.LFTiresAvailable,
                        rear: evt.values.LRTiresAvailable,
                    },
                    right: {
                        front: evt.values.RFTiresAvailable,
                        rear: evt.values.RRTiresAvailable,
                    },
                },
                fuel: {
                    remaining: evt.values.FuelLevel,
                    percent: evt.values.FuelLevelPct,
                },
            };

            if (mainWindow) {
                mainWindow.webContents.send('telemetry_update', {
                    drivers: sessionRacers,
                    info: sessionInfo,
                    driverData,
                });
            }
        });

        setInterval(() => {
            if (!hasCompletedSetup || sessionRacers.length < 1) return;
            Streaming.emit(
                'standings',
                JSON.stringify({
                    sessionInfo,
                    sessionRacers,
                    driverData,
                    options: {
                        channel: options.channel,
                        isStreamer: options.isStreamer,
                    },
                })
            );
        }, options.updateInterval);

        if (hasCompletedSetup) Streaming.emit('awake', options.channel);

        Streaming.on('check_awake', (d) => {
            if (hasCompletedSetup) Streaming.emit('awake', options.channel);
        });
    });

    Iracing.on('Connected', () => {
        if (connection !== 'connected') connection = 'connected';
        console.log('CONNECTED');
        if (mainWindow) {
            mainWindow.webContents.send('connection', connection);
        }
    });

    Iracing.on('Disconnected', () => {
        if (connection !== 'disconnected') connection = 'disconnected';
        console.log('DISCONNECTED');
        if (mainWindow) {
            mainWindow.webContents.send('connection', connection);
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady()
    .then(() => {
        createWindow();
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the-
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) createWindow();
        });
    })
    .catch(console.log);

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});
