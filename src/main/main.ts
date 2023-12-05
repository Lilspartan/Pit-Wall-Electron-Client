/* eslint-disable prefer-const */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-case-declarations */
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
import IracingClient from 'iracing-sdk-js';
import io from 'socket.io-client';
import RPC from 'discord-rpc';
import axios from 'axios';
import settings from 'electron-settings';
import {
    Connection,
    QualifyingResult,
    RPCActivity,
    Session,
    IRSDKSession,
    Driver,
    LapData,
} from 'types/interfaces';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

function decimalColorToHTMLcolor(number) {
    let intnumber = number - 0;
    let red: number;
    let green: number;
    let blue: number;
    const template = '#000000';
    red = (intnumber & 0x0000ff) << 16;
    green = intnumber & 0x00ff00;
    blue = (intnumber & 0xff0000) >>> 16;
    intnumber = red | green | blue;
    let HTMLcolor = intnumber.toString(16);
    HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;
    return HTMLcolor;
}

console.log(`Settings File: ${settings.file()}`);

let clientUpToDate = true;

const clientId = '994418116090142830';

const rpcClient = new RPC.Client({ transport: 'ipc' });
let RPCTime = null;

const updateRPC = async () => {
    console.log('Updating RPC');

    if (RPCTime === null || RPCTime.connection !== connection) {
        RPCTime = {
            timestamp: Date.now(),
            connection,
        };
    }

    if (!rpcClient) {
        console.log('No RPC Client');
        return;
    }

    let RPCDetails;
    switch (sessionInfo.session.type) {
        case 'LOADING':
            RPCDetails = 'Running the Pit Wall';
            break;
        case 'PRACTICE':
            RPCDetails = 'Running the Pit Wall (In Practice)';
            break;
        case 'QUALIFY':
            RPCDetails = 'Running the Pit Wall (In Qualifying)';
            break;
        case 'RACE':
            RPCDetails = 'Running the Pit Wall (In a Race)';
            break;
        default:
            RPCDetails = 'Running the Pit Wall';
            break;
    }

    const activity: RPCActivity = {
        details:
            connection === 'connected' ? RPCDetails : 'Running the Pit Wall',
        state:
            connection === 'connected'
                ? 'Currently Racing'
                : 'Not Currently Racing',
        startTimestamp: RPCTime !== null ? RPCTime.timestamp : Date.now(),
        largeImageKey: 'm_logo',
        largeImageText: 'Using the Gabir Motors Pit Wall',
        smallImageKey: connection === 'connected' ? 'in_race' : 'not_in_race',
        smallImageText:
            connection === 'connected'
                ? 'Currently Racing'
                : 'Not Currently Racing',
        instance: false,
    };

    if (hasCompletedSetup) {
        activity.buttons = [
            {
                label: `View ${options.channel}'s Pit Wall`,
                url: `https://pitwall.gabirmotors.com/user/${options.channel}`,
            },
        ];
    }

    rpcClient.setActivity(activity);
};

const Iracing = IracingClient.getInstance();
const Streaming = io('http://pitwall.gabirmotors.com');

let hasCompletedSetup = false;
let connection: Connection = 'connecting';
const checkSettings = async () => {
    hasCompletedSetup = await settings.has('channel');

    if (hasCompletedSetup) {
        options.channel = (await settings.get('channel')) as string;
        options.isStreamer = (await settings.get('isStreamer')) as boolean;
        options.fuelIsPublic = (await settings.get('fuelIsPublic')) as boolean;
        options.password = (await settings.get('password')) as string;
        options.profile_icon = (await settings.get('profile_icon')) as string;

        if (options.fuelIsPublic === undefined) options.fuelIsPublic = false;
        if (options.password === undefined) options.password = 'abcdef';
    }
};

const options = {
    updateInterval: 1000,
    sessionNum: 0,
    channel: '',
    isStreamer: true,
    fuelIsPublic: false,
    password: 'abcdef',
    profile_icon: 'none',
    charity: null,
};

let sessionRacers: Driver[] = [];
let sessionInfo: Session = {
    flags: [],
    isPALeagueRace: false,
    focusedCarIndex: 1,
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

const driverData = {
    tiresRemaining: {
        left: { front: 0, rear: 0 },
        right: { front: 0, rear: 0 },
    },
    fuel: { remaining: 0, percent: 0 },
    carIndex: 0,
    driver: null,
    laps: [],
    firstRPM: 0,
    shiftRPM: 0,
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

        // TODO: Add different IPC channels
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
                    mainWindow.webContents.send('app_version', {
                        version: '0.5.1',
                    });
                    break;
                case 'open_link':
                    shell.openExternal(args[1]);
                    break;
                case 'toggle_fuel_public_status':
                    const currentFuelStatus = await settings.get(
                        'fuelIsPublic'
                    );
                    await settings.set('fuelIsPublic', !currentFuelStatus);
                    options.fuelIsPublic = !currentFuelStatus;
                    mainWindow.webContents.send('user_data', options);
                    break;
                case 'change_password':
                    await settings.set('password', args[1]);
                    options.password = args[1];
                    mainWindow.webContents.send('user_data', options);
                    break;
                case 'charity_settings':
                    if (args[2]) {
                        options.charity = args[1];
                    } else {
                        options.charity = null;
                    }
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
                await settings.set('fuelIsPublic', false);
                await settings.set('password', '');
                await settings.set('profile_icon', userData.picture);

                options.channel = userData.preferred_username;
                options.isStreamer = true;
                options.fuelIsPublic = false;
                options.password = '';
                options.profile_icon = userData.picture;

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

        Iracing.on('SessionInfo', (evt: IRSDKSession) => {
            if (connection !== 'connected') {
                connection = 'connected';
                mainWindow.webContents.send('connection', connection);
            }

            const drivers = evt.data.DriverInfo.Drivers;

            sessionInfo.isPALeagueRace = evt.data.WeekendInfo.LeagueID === 4778;
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

                let qualifyingResult: QualifyingResult = null;
                const qualifyingResults = evt.data.QualifyResultsInfo?.Results;

                if (
                    qualifyingResults !== null &&
                    qualifyingResults !== undefined
                ) {
                    for (let j = 0; j < qualifyingResults.length; j++) {
                        if (qualifyingResults[j].CarIdx === driver.CarIdx) {
                            qualifyingResult = {
                                position: qualifyingResults[j].Position,
                                classPosition:
                                    qualifyingResults[j].ClassPosition,
                                fastestLap: qualifyingResults[j].FastestLap,
                                fastestTime: qualifyingResults[j].FastestTime,
                            };
                        }
                    }
                }

                if (!driver.CarIsPaceCar) {
                    const _d = {
                        carIndex: driver.CarIdx,
                        name: driver.UserName,
                        userID: driver.UserID,
                        carNumber: driver.CarNumber,
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
                        qualifyingResult,
                        class: {
                            car: driver.CarScreenNameShort,
                            color: driver.CarClassColor.toString(16),
                            id: driver.CarClassID,
                        },
                        teamName: driver.TeamName,
                        license: {
                            iRating: driver.IRating,
                            licenseLevel: driver.LicLevel,
                            licenseSubLevel: driver.LicSubLevel,
                            licenseName: driver.LicString,
                            licenseColor: decimalColorToHTMLcolor(
                                driver.LicColor
                            ),
                        },
                        isSpectator: driver.IsSpectator === 1,
                        isAI: driver.CarIsAI === 1,
                        estTimeIntoLap: 0,
                    };
                    sessionRacers.push(_d);

                    driverData.firstRPM =
                        evt.data.DriverInfo.DriverCarSLFirstRPM;
                    driverData.shiftRPM =
                        evt.data.DriverInfo.DriverCarSLShiftRPM;

                    if (driver.CarIdx === evt.data.DriverInfo.DriverCarIdx) {
                        driverData.carIndex = evt.data.DriverInfo.DriverCarIdx;
                        driverData.driver = _d;
                    }
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
                isPALeagueRace: sessionInfo.isPALeagueRace,
                focusedCarIndex: evt.values.CamCarIdx,
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
                sessionRacers[i].estTimeIntoLap =
                    evt.values.CarIdxEstTime[_idx];
            }

            driverData.tiresRemaining = {
                left: {
                    front: evt.values.LFTiresAvailable,
                    rear: evt.values.LRTiresAvailable,
                },
                right: {
                    front: evt.values.RFTiresAvailable,
                    rear: evt.values.RRTiresAvailable,
                },
            };
            driverData.fuel = {
                remaining: evt.values.FuelLevel,
                percent: evt.values.FuelLevelPct,
            };

            if (driverData.laps.length) {
                if (
                    driverData.laps[0].lapNumber <
                    driverData.driver.raceData.lap
                ) {
                    const _lap: LapData = {
                        lapNumber: driverData.driver.raceData.lap,
                        fuelAtStartPct: driverData.fuel.percent,
                        fuelAtStartLiters: driverData.fuel.remaining,
                        lapTime: -1,
                        fuelUsedLiters: -1,
                        fuelUsedPct: -1,
                        sessionType: sessionInfo.session.type,
                    };

                    const _workingLap = driverData.laps.shift();

                    _workingLap.lapTime = driverData.driver.lapTimes.last;
                    _workingLap.fuelUsedLiters =
                        _workingLap.fuelAtStartLiters -
                        driverData.fuel.remaining;
                    _workingLap.fuelUsedPct =
                        _workingLap.fuelAtStartPct - driverData.fuel.percent;

                    driverData.laps.unshift(_workingLap);
                    driverData.laps.unshift(_lap);
                } else if (
                    driverData.laps[0].lapNumber ===
                    driverData.driver.raceData.lap
                ) {
                    driverData.laps[0].lapTime = -1;
                } else if (
                    driverData.laps[0].lapNumber >
                    driverData.driver.raceData.lap
                ) {
                    // driverData.laps = [];
                }
            } else if (driverData.driver) {
                const _lap: LapData = {
                    lapNumber: driverData.driver.raceData.lap,
                    fuelAtStartPct: driverData.fuel.percent,
                    fuelAtStartLiters: driverData.fuel.remaining,
                    lapTime: -1,
                    fuelUsedLiters: -1,
                    fuelUsedPct: -1,
                    sessionType: sessionInfo.session.type,
                };

                driverData.laps.unshift(_lap);
            }

            if (mainWindow) {
                mainWindow.webContents.send('telemetry_update', {
                    drivers: sessionRacers,
                    info: sessionInfo,
                    driverData,
                });
            }
        });

        setInterval(() => {
            if (
                !hasCompletedSetup ||
                sessionRacers.length < 1 ||
                !clientUpToDate
            )
                return;
            Streaming.emit(
                'standings',
                JSON.stringify({
                    sessionInfo,
                    sessionRacers,
                    driverData,
                    options: {
                        channel: options.channel,
                        isStreamer: options.isStreamer,
                        fuelIsPublic: options.fuelIsPublic,
                        password: options.password,
                        profile_icon: options.profile_icon,
                        charity: options.charity,
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
        driverData.laps = [];
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

        app.quit();
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
    clientUpToDate = false;
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
    clientUpToDate = false;
});

rpcClient.on('ready', () => {
    updateRPC();

    setInterval(() => {
        updateRPC();
    }, 10000);
});

rpcClient.login({ clientId }).catch(console.error);
console.log(rpcClient);
