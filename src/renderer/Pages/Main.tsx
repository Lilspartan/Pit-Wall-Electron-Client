/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { CgMaximize, CgClose, CgMinimize } from 'react-icons/cg';
import { VscDebugRestart } from 'react-icons/vsc';
import {
  Session,
  Driver,
  DriverData,
  Connection,
} from '../../types/interfaces';
import { Loading, Card, Button, Alert } from '../Components';

type IPCSessionUpdate = {
  session: Session;
};

type IPCTelemetryUpdate = {
  drivers: Driver[];
  session: Session;
  driverData: DriverData;
};

type UserData = {
    channel: string;
    isStreamer: boolean;
}

type IPCVersion = {
    version: string;
}

type UpdateState = 
    'up_to_date' |
    'update_available' |
    'update_downloaded';

const Main = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [drivers, setDrivers] = useState<Driver[] | null>(null);
    const [connection, setConnection] = useState<Connection>('connecting');
    const [loading, setLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(true);
    const [doNoTwitchSetup, setDoNoTwitchSetup] = useState(false);
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState("");
    const [version, setVersion] = useState('0.0.0');
    const [updateState, setUpdateState] = useState<UpdateState>('up_to_date');

    useEffect(() => {
        window.electron.ipcRenderer.on(
            'session_update',
            (data: IPCSessionUpdate) => {
                setSession(data.session);

                console.log(data);
            }
        );

        window.electron.ipcRenderer.on(
            'telemetry_update',
            (data: IPCTelemetryUpdate) => {
                setSession(data.session);
                setDrivers(data.drivers);

                // console.log(data);
            }
        );

        window.electron.ipcRenderer.on('connection', (data: Connection) => {
            console.log(data);
            setConnection(data);
        });

        window.electron.ipcRenderer.on('setup_complete', (data: boolean) => {
            console.log(`Completed Setup: ${data}`);
            setShowSetup(!data);
            setLoading(false);
        })

        window.electron.ipcRenderer.on('user_data', (data) => {
            console.log(`User Data: ${JSON.stringify(data)}`);
            setUserData(data);
            if ((data as UserData).channel !== '') {
                setShowSetup(false);
            }
            setLoading(false);
        })  

        window.electron.ipcRenderer.on('app_version', (data: IPCVersion) => {
            console.log(`App Version: ${JSON.stringify(data)}`);
            setVersion(data.version);
        })  
        
        window.electron.ipcRenderer.on('update_available', () => {
            setUpdateState('update_available');
        })  

        window.electron.ipcRenderer.on('update_downloaded', () => {
            setUpdateState('update_downloaded');
        })  

        window.electron.ipcRenderer.sendMessage('ipc-example', [ 'app_version' ])
    }, []);

    const openTwitchAuth = () => {
        if (typeof window !== "undefined") {
            window.electron.ipcRenderer.sendMessage('ipc-example', [ 'twitch_auth' ]);
        }
    }

    return (
        <>
            {updateState === 'update_available' ? (
                <div className="flex flex-row justify-center w-full">
                    <div className="p-4 fixed bg-light-card-handle text-black z-40 m-4 rounded-lg flex flex-row bottom-8">
                        <div>
                            <span className="pr-2 font-bold">Update Available</span>
                            <span>An update is available for the Pit Wall</span>
                        </div>

                        <div>
                            <a className="cursor-pointer" onClick={() => {
                                window.electron.ipcRenderer.sendMessage('ipc-example', [ 'restart_app' ]);
                            }}>
                                <VscDebugRestart className="inline ml-4" />
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div />
            )}

            <div className = "h-12 titlebar bg-dark-card w-full flex flex-row justify-between">
                <div className = "text-white acumin my-auto text-3xl ml-4 align-middle no-select">
                    Pit Wall Client {version}
                </div>

                <div className="text-white flex flex-row-reverse text-3xl my-auto mr-4 titlebar-buttons">
                    <div><CgClose className = "cursor-pointer mx-2" id = "close" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'close' ]) }} /></div>
                    <div><CgMaximize className = "cursor-pointer mx-2" id = "maximize" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'maximize' ]) }} /></div>
                    <div><CgMinimize className = "cursor-pointer mx-2" id = "minimize" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'minimize' ]) }} /></div>
                </div>
            </div>

            <Loading loading = { loading } />

            <div id = "bg" className = "dark background-c min-h-screen h-auto">
                <div className = "text-black dark:text-white flex flex-row justify-center px-16">
                    {showSetup && !doNoTwitchSetup ? (
                        <Card title="Setup">
                            <h1 className = "text-center text-3xl font-extrabold mb-4">Setup</h1>
                            <Button block click = {openTwitchAuth}>With Twitch Integration</Button>
                            <Button block click = {() => {
                                setDoNoTwitchSetup(true);
                            }}>Without Twitch Integration</Button>
                        </Card>
                    ) : <div />}

                    {showSetup && doNoTwitchSetup ? (
                        <Card title="No Twitch Integration Setup">
                            <h1 className = "text-center text-3xl font-extrabold mb-4">Setup Without Twitch</h1>

                            <input onChange = {(e) => { 
                                setName(e.target.value);
                            }} type="text" className = "mt-6 rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200 w-full border-2" placeholder='Name' value = {name}/>
                            <Button block click = {() => {
                                window.electron.ipcRenderer.sendMessage('ipc-example', [ 'setup_name', name ]);
                            }}> Submit</Button>
                        </Card>
                    ) : <div />}

                    {!showSetup && userData !== null ? (
                        <>
                            <Card title = "Welcome!">
                                <h1 className = "text-center text-3xl font-extrabold mb-4">Hello { userData.channel }</h1>
                                <span className = "font-bold">Your Pit Wall Link: </span> <br />
                                <span className = "italic">https://pitwall.gabirmotors.com/{userData.channel}</span>
                            </Card>

                            <Card title = "iRacing Connection Status" id = "connection-card">
                                <h1 className = "font-bold text-center text-xl inline">Status: </h1>
                                    <h1 className = "font-bold text-center text-xl inline">{connection === "disconnected" ? (
                                        <span className = "text-red-600">Disconnected</span> 
                                    ): (connection === "connected" ? (
                                        <span className = "text-green-600">Connected</span> 
                                    ) : (
                                        <span className = "text-yellow-600">Connecting</span> 
                                    ))}
                                </h1>
                            </Card>

                            <Card title = "Setup">
                                <Button block click = {() => {
                                    setShowSetup(true);
                                    setDoNoTwitchSetup(false);
                                }}>Redo Setup</Button>
                            </Card>
                        </>
                    ): <div />}
                </div>
            </div>
        </>
    );
};

export default Main;
