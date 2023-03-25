/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { CgMaximize, CgClose, CgMinimize } from 'react-icons/cg';
import { BsTwitter, BsGithub } from 'react-icons/bs';
import { SiGmail } from 'react-icons/si';
import { VscDebugRestart } from 'react-icons/vsc';
import {
  Session,
  Driver,
  DriverData,
  Connection,
  CharityOptions,
} from '../../types/interfaces';
import { Loading, Card, Button, Alert } from '../Components';

type IPCSessionUpdate = {
  info: Session;
};

type IPCTelemetryUpdate = {
  drivers: Driver[];
  info: Session;
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
    const [driverData, setDriverData] = useState<DriverData | null>(null);
    const [connection, setConnection] = useState<Connection>('connecting');
    const [loading, setLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(true);
    const [doNoTwitchSetup, setDoNoTwitchSetup] = useState(false);
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState("");
    const [version, setVersion] = useState('Getting Version');
    const [updateState, setUpdateState] = useState<UpdateState>('up_to_date');
    const [doCharity, setDoCharity] = useState(false);
    const [charitySettings, setCharitySettings] = useState<CharityOptions | null>({
        name: "",
        description: "",
        link: "",
        callToAction: "Donate",
    });

    useEffect(() => {
        window.electron.ipcRenderer.on(
            'session_update',
            (data: IPCSessionUpdate) => {
                setSession(data.info);

                console.log(data);
            }
        );

        window.electron.ipcRenderer.on(
            'telemetry_update',
            (data: IPCTelemetryUpdate) => {
                setSession(data.info);
                setDrivers(data.drivers);
                setDriverData(data.driverData);

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

    useEffect(() => {
        if (charitySettings.name !== "") {
            window.electron.ipcRenderer.sendMessage('ipc-example', [ 'charity_settings', charitySettings, doCharity ])
        }
    }, [doCharity, charitySettings])

    const openTwitchAuth = () => {
        if (typeof window !== "undefined") {
            window.electron.ipcRenderer.sendMessage('ipc-example', [ 'twitch_auth' ]);
        }
    }

    return (
        <>
            {updateState === 'update_downloaded' ? (
                <div className="flex flex-row justify-center w-full">
                    <div className="p-4 fixed bg-light-card-handle text-black z-40 m-4 rounded-lg flex flex-row bottom-8">
                        <div>
                            <span className="pr-2 font-bold">Update Downloaded</span>
                            <span>An update has been downloaded for the Pit Wall, restart the Pit Wall to install the update</span>
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
            ) : updateState === 'update_available' ? (
                <div className="flex flex-row justify-center w-full">
                    <div className="p-4 fixed bg-light-card-handle text-black z-40 m-4 rounded-lg flex flex-row bottom-8">
                        <div>
                            <span className="pr-2 font-bold">Update Available</span>
                            <span>An update is available for the Pit Wall and will be downloaded automatically</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div />
            )}

            <div className = "h-12 titlebar bg-dark-card w-full flex flex-row justify-between">
                <div className = "text-white acumin my-auto text-3xl ml-4 align-middle no-select">
                    Pit Wall Client v0.9.0
                </div>

                <div className="text-white flex flex-row-reverse text-3xl my-auto mr-4 titlebar-buttons z-50">
                    <div><CgClose className = "cursor-pointer mx-2" id = "close" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'close' ]) }} /></div>
                    <div><CgMaximize className = "cursor-pointer mx-2" id = "maximize" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'maximize' ]) }} /></div>
                    <div><CgMinimize className = "cursor-pointer mx-2" id = "minimize" onClick = {() => { window.electron.ipcRenderer.sendMessage('ipc-example', [ 'minimize' ]) }} /></div>
                </div>
            </div>

            <Loading loading = { loading } />

            <div id = "bg" className = "dark background-c min-h-screen h-auto pt-16">
                {showSetup && !doNoTwitchSetup ? (
                    <div className = "text-black dark:text-white flex flex-row justify-center px-16">
                        <Card title="Setup">
                            <h1 className = "text-center text-3xl font-extrabold mb-4">Setup</h1>
                            <Button block click = {openTwitchAuth}>With Twitch Integration</Button>
                            {/* <Button block click = {() => {
                                setDoNoTwitchSetup(true);
                            }}>Without Twitch Integration</Button> */}
                        </Card>
                    </div>
                ) : <div />}

                {showSetup && doNoTwitchSetup ? (
                    <div className = "text-black dark:text-white flex flex-row justify-center px-16">
                        <Card title="No Twitch Integration Setup">
                            <h1 className = "text-center text-3xl font-extrabold mb-4">Setup Without Twitch</h1>

                            <input onChange = {(e) => { 
                                setName(e.target.value);
                            }} type="text" className = "mt-6 rounded-lg bg-light-card-handle dark:bg-dark-card-handle py-2 px-4 transition duration-200 w-full border-2" placeholder='Name' value = {name}/>
                            <Button block click = {() => {
                                window.electron.ipcRenderer.sendMessage('ipc-example', [ 'setup_name', name ]);
                            }}> Submit</Button>
                        </Card>
                    </div>
                ) : <div />}

                {!showSetup && userData !== null ? (
                    <>
                        <div className = "px-16 py-4 text-white min-h-screen">
                            <div className = "flex flex-row justify-between">
                                <div>
                                    <h1 className = "text-4xl">Hello, <span className = "font-extrabold">{ userData.channel }</span>!</h1>
                                    <h2 className = "text-3xl mt-4 opacity-70"><a className="font-bold cursor-pointer link inline-block" onClick = {() => {
                                        window.electron.ipcRenderer.sendMessage('ipc-example', [ 'open_link', `https://pitwall.gabirmotors.com/user/${userData.channel}` ])
                                    }}>Visit your Pit Wall</a></h2>

                                    <h3 className = "font-bold text-xl mt-8">{connection === "disconnected" ? (
                                            <span className = "text-red-600">No iRacing instance found</span> 
                                        ): (connection === "connected" ? (
                                            <span className = "text-green-600">iRacing instance found</span> 
                                        ) : (
                                            <span className = "text-yellow-600">Looking for an iRacing instance</span> 
                                        ))}
                                    </h3>

                                    <Button block click = {() => {
                                        setShowSetup(true);
                                        setDoNoTwitchSetup(false);
                                    }}>Redo Setup</Button>

                                    <div id="options">
                                        <Button block click = {() => {
                                            window.electron.ipcRenderer.sendMessage('ipc-example', [ 'toggle_fuel_public_status' ])
                                        }}>{userData.fuelIsPublic ? 'Fuel Data: Public' : 'Fuel Data: Private'}</Button>    

                                       <div className = "mt-4">
                                            <label htmlFor="password" className = "mt-4 font-bold text-lg">Private Page Password:</label>
                                            <input name = "password" id = "password" className = "block font-bold text-lg rounded-lg bg-dark-card-handle p-2 w-full" type="text" placeholder='Password for Private Pages' value = {userData.password} onChange = {(e) => {
                                                window.electron.ipcRenderer.sendMessage('ipc-example', [ 'change_password', e.target.value ]) 
                                            }} />
                                       </div>
                                    </div>

                                    <h4 className = "mt-16 text-xl opacity-50">Overlays Coming <span className = "font-bold">Soon</span></h4>
                                </div>

                                <div>
                                    <h2 className = "text-3xl"><span className = "font-extrabold">{ session !== null ? session.track.name : "Not in a Race" }</span></h2>
                                    <h3 className = "text-2xl mt-4"><span className = "font-bold">{ drivers !== null ? drivers.length : "0" }</span> Drivers found in your session</h3>
                                
                                    {/* <pre>
                                        {JSON.stringify(driverData.laps, null, 4)}
                                    </pre> */}

                                    <div className = "mt-16">
                                        <label htmlFor = "charityCheckBox" className = "mr-4">Show Charity Info?</label>
                                        <input id = "charityCheckBox" type = "checkbox" checked = { doCharity } onChange = {(e) => {
                                            setDoCharity(e.target.checked);
                                        }} />

                                        { doCharity && (
                                            <div className = "mt-4">
                                                <div className = "mt-2">
                                                    <label htmlFor = "charityName">Campaign Name</label>
                                                    <input value = { charitySettings.name } onChange = {(e) => {
                                                        setCharitySettings({
                                                            ...charitySettings,
                                                            name: e.target.value
                                                        })
                                                    }} id = "charityName" type = "text" className = "block font-bold text-lg rounded-lg bg-dark-card-handle p-2 w-full"/>
                                                </div>

                                                <div className = "mt-2">
                                                    <label htmlFor = "link">Campaign Link</label>
                                                    <input value = { charitySettings.link } onChange = {(e) => {
                                                        setCharitySettings({
                                                            ...charitySettings,
                                                            link: e.target.value
                                                        })
                                                    }} id = "link" type = "url" className = "block font-bold text-lg rounded-lg bg-dark-card-handle p-2 w-full"/>
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className = "absolute bottom-8 w-full text-center text-white">
                            Created by <a className="font-bold cursor-pointer link inline-block" onClick = {() => {
                                window.electron.ipcRenderer.sendMessage('ipc-example', [ 'open_link', `https://twitter.com/gabekrahulik` ])
                            }}>Gabe Krahulik</a>
                             <div className="flex flex-row justify-center text-4xl mt-4 gap-8">
                                <a href="https://twitter.com/gabekrahulik" target="_new">
                                    <BsTwitter className="hover:text-twitter-brand transition-all duration-200" />
                                </a>
                                <a href="https://github.com/LilSpartan" target="_new">
                                    <BsGithub className="hover:text-github-brand transition-all duration-200" />
                                </a>
                                <a href="mailto:gabekrahulik@gmail.com" target="_new">
                                    <SiGmail className="hover:text-gmail-brand transition-all duration-200" />
                                </a>
                            </div>
                        </div>
                    </>
                ): <div />}
            </div>
        </>
    );
};

export default Main;
