import { MouseEventHandler } from 'react';

export interface RaceData {
    position: number;
    onPitRoad: boolean;
    class: number;
    f2Time: number;
    lap: number;
    lapsCompleted: number;
    fastRepairsUsed: number;
    lapPercent: number;
}

export interface CarData {
    trackSurface: TrackSurface;
    steer: number;
    rpm: number;
    gear: number;
}

export interface Driver {
    carIndex: number;
    name: string;
    userID: number;
    carNumber: string;
    isPaceCar: boolean;
    raceData: RaceData;
    carData: CarData;
    lapTimes: LapTimes;
    flags: Flag[];
    qualifyingResult: QualifyingResult | null;
    class: CarClass;
    teamName: string;
    license: DriverLicense;
    isSpectator: boolean;
    isAI: boolean;
}

export interface DriverLicense {
    iRating: number;
    licenseLevel: number;
    licenseSubLevel: number;
    licenseName: string;
    licenseColor: string | null;
}

export interface CarClass {
    id: number;
    car: string;
    color: string;
}

export interface QualifyingResult {
    position: number;
    classPosition: number;
    fastestLap: number;
    fastestTime: number;
}

export interface LapTimes {
    last: number;
    best: {
        time: number;
        lap: number;
    };
}

export interface Session {
    flags: Flag[];
    isPALeagueRace: boolean;
    focusedCarIndex: number;
    session: {
        number: number;
        type: SessionType;
        timeRemaining: number;
        fastRepairs: number | string;
        fastestLap: FastestLap[] | null;
    };
    track: {
        name: string;
        id: number;
        city: string;
        country: string;
        temperature: string;
        length: string;
    };
    weather: {
        windSpeed: string;
        temperature: string;
        skies: string;
    };
}

export interface FastestLap {
    CarIdx: number;
    FastestLap: number;
    FastestTime: number;
}

export type SessionType = 'PRACTICE' | 'QUALIFY' | 'RACE' | 'LOADING';

export type Flag =
    | 'OneLapToGreen'
    | 'StartReady'
    | 'Caution'
    | 'StartHidden'
    | 'Checkered'
    | 'Green'
    | 'GreenHeld'
    | 'CautionWaving'
    | 'White'
    | string;

export type TrackSurface =
    | 'OnTrack'
    | 'OffTrack'
    | 'AproachingPits'
    | 'InPitStall'
    | 'NotInWorld'
    | string;

export type Connection = 'disconnected' | 'connected' | 'connecting';

export interface DriverData {
    tiresRemaining: {
        left: {
            front: number;
            rear: number;
        };
        right: {
            front: number;
            rear: number;
        };
    };
    fuel: {
        remaining: number;
        percent: number;
    };
    carIndex: number;
    driver: Driver;
}

export interface DismissedCard {
    id: string;
    reopen: MouseEventHandler;
    name: string;
}

// Generated by https://quicktype.io

export interface D {
    name: string;
    desc: string;
    unit: string;
    count: number;
    type: Type;
}

export enum Type {
    BitField = 'bitField',
    Bool = 'bool',
    Double = 'double',
    Float = 'float',
    Int = 'int',
}

export interface Options {
    channel: string;
}

type RPCButton = {
    label: string;
    url: string;
};
export interface RPCActivity {
    details: string;
    state: string;
    startTimestamp: number;
    largeImageKey: string;
    largeImageText: string;
    smallImageKey?: string;
    smallImageText?: string;
    instance: boolean;
    button1?: string;
    url1?: string;
    button2?: string;
    url2?: string;
    buttons?: RPCButton[];
}

// Generated by https://quicktype.io

export interface IRSDKSession {
    timestamp: string;
    data: Data;
}

export interface Data {
    WeekendInfo: WeekendInfo;
    SessionInfo: SessionInfo;
    QualifyResultsInfo: QualifyResultsInfo;
    CameraInfo: CameraInfo;
    RadioInfo: RadioInfo;
    DriverInfo: DriverInfo;
    SplitTimeInfo: SplitTimeInfo;
    CarSetup: CarSetup;
}

export interface CameraInfo {
    Groups: Group[];
}

export interface Group {
    GroupNum: number;
    GroupName: string;
    Cameras: Camera[];
    IsScenic?: boolean;
}

export interface Camera {
    CameraNum: number;
    CameraName: string;
}

export interface CarSetup {
    UpdateCount: number;
    TiresAero: TiresAero;
    Chassis: Chassis;
}

export interface Chassis {
    Front: Front;
    LeftFront: { [key: string]: string };
    LeftRear: { [key: string]: string };
    InCarDials: InCarDials;
    RightFront: { [key: string]: string };
    RightRear: { [key: string]: string };
    Rear: Rear;
}

export interface Front {
    FarbConnection: string;
    FarbSetting: string;
    ToeIn: string;
    FrontMasterCyl: string;
    RearMasterCyl: string;
    BrakePads: string;
    FuelLevel: string;
    CrossWeight: string;
}

export interface InCarDials {
    DisplayPage: string;
    BrakePressureBias: string;
    TracCtrl_TccSetting: string;
    TracCtrl_TcrSetting: string;
    ThrottleMapSetting: number;
    AbsSetting: string;
    EngineMapSetting: string;
    NightLedStrips: string;
}

export interface Rear {
    RarbConnection: string;
    RarbSetting: string;
    DiffClutchPlates: number;
    DiffPreload: string;
    WingSetting: string;
}

export interface TiresAero {
    LeftFront: LeftFront;
    LeftRear: LeftFront;
    RightFront: LeftFront;
    RightRear: LeftFront;
    AeroBalanceCalc: AeroBalanceCalc;
}

export interface AeroBalanceCalc {
    FrontRhAtSpeed: string;
    RearRhAtSpeed: string;
    WingSetting: string;
    FrontDownforce: string;
}

export interface LeftFront {
    StartingPressure: string;
    LastHotPressure: string;
    LastTempsOMI?: string;
    TreadRemaining: string;
    LastTempsIMO?: string;
}

export interface DriverInfo {
    DriverCarIdx: number;
    DriverUserID: number;
    PaceCarIdx: number;
    DriverHeadPosX: number;
    DriverHeadPosY: number;
    DriverHeadPosZ: number;
    DriverCarIdleRPM: number;
    DriverCarRedLine: number;
    DriverCarEngCylinderCount: number;
    DriverCarFuelKgPerLtr: number;
    DriverCarFuelMaxLtr: number;
    DriverCarMaxFuelPct: number;
    DriverCarGearNumForward: number;
    DriverCarGearNeutral: number;
    DriverCarGearReverse: number;
    DriverCarSLFirstRPM: number;
    DriverCarSLShiftRPM: number;
    DriverCarSLLastRPM: number;
    DriverCarSLBlinkRPM: number;
    DriverCarVersion: string;
    DriverPitTrkPct: number;
    DriverCarEstLapTime: number;
    DriverSetupName: string;
    DriverSetupIsModified: number;
    DriverSetupLoadTypeName: string;
    DriverSetupPassedTech: number;
    DriverIncidentCount: number;
    Drivers: SDKDriver[];
}

export interface SDKDriver {
    CarIdx: number;
    UserName: string;
    AbbrevName: null;
    Initials: null;
    UserID: number;
    TeamID: number;
    TeamName: string;
    CarNumber: string;
    CarNumberRaw: number;
    CarPath: string;
    CarClassID: number;
    CarID: number;
    CarIsPaceCar: number;
    CarIsAI: number;
    CarScreenName: string;
    CarScreenNameShort: string;
    CarClassShortName: null;
    CarClassRelSpeed: number;
    CarClassLicenseLevel: number;
    CarClassMaxFuelPct: CarClassMaxFuelPct;
    CarClassWeightPenalty: CarClassWeightPenalty;
    CarClassPowerAdjust: CarClassPowerAdjust;
    CarClassDryTireSetLimit: TrackFogLevel;
    CarClassColor: number;
    CarClassEstLapTime: number;
    IRating: number;
    LicLevel: number;
    LicSubLevel: number;
    LicString: LicString;
    LicColor: number | string;
    IsSpectator: number;
    CarDesignStr: string;
    HelmetDesignStr: string;
    SuitDesignStr: string;
    CarNumberDesignStr: CarNumberDesignStr;
    CarSponsor_1: number;
    CarSponsor_2: number;
    CurDriverIncidentCount: number;
    TeamIncidentCount: number;
}

export enum TrackFogLevel {
    The0 = '0 %',
}

export enum CarClassMaxFuelPct {
    The1000 = '1.000 %',
}

export enum CarClassPowerAdjust {
    The0000 = '0.000 %',
}

export enum CarClassWeightPenalty {
    The0000Kg = '0.000 kg',
}

export enum CarNumberDesignStr {
    The00 = '0,0,,,',
    The00Ffffff777777000000 = '0,0,FFFFFF,777777,000000',
    The00FfffffFfffffFfffff = '0,0,ffffff,ffffff,ffffff',
}

export enum LicString {
    R000 = 'R 0.00',
    R001 = 'R 0.01',
}

export interface QualifyResultsInfo {
    Results: Result[];
}

export interface Result {
    Position: number;
    ClassPosition: number;
    CarIdx: number;
    FastestLap: number;
    FastestTime: number;
}

export interface RadioInfo {
    SelectedRadioNum: number;
    Radios: Radio[];
}

export interface Radio {
    RadioNum: number;
    HopCount: number;
    NumFrequencies: number;
    TunedToFrequencyNum: number;
    ScanningIsOn: number;
    Frequencies: Frequency[];
}

export interface Frequency {
    FrequencyNum: number;
    FrequencyName: string;
    Priority: number;
    CarIdx: number;
    EntryIdx: number;
    ClubID: number;
    CanScan: number;
    CanSquawk: number;
    Muted: number;
    IsMutable: number;
    IsDeletable: number;
}

export interface SessionInfo {
    Sessions: SDKSession[];
}

export interface SDKSession {
    SessionNum: number;
    SessionLaps: string;
    SessionTime: string;
    SessionNumLapsToAvg: number;
    SessionType: string;
    SessionTrackRubberState: string;
    SessionName: SessionType;
    SessionSubType: null;
    SessionSkipped: number;
    SessionRunGroupsUsed: number;
    SessionEnforceTireCompoundChange: number;
    ResultsPositions: ResultsPosition[];
    ResultsFastestLap: ResultsFastestLap[];
    ResultsAverageLapTime: number;
    ResultsNumCautionFlags: number;
    ResultsNumCautionLaps: number;
    ResultsNumLeadChanges: number;
    ResultsLapsComplete: number;
    ResultsOfficial: number;
}

export interface ResultsFastestLap {
    CarIdx: number;
    FastestLap: number;
    FastestTime: number;
}

export interface ResultsPosition {
    Position: number;
    ClassPosition: number;
    CarIdx: number;
    Lap: number;
    Time: number;
    FastestLap: number;
    FastestTime: number;
    LastTime: number;
    LapsLed: number;
    LapsComplete: number;
    JokerLapsComplete: number;
    LapsDriven: number;
    Incidents: number;
    ReasonOutId: number;
    ReasonOutStr: ReasonOutStr;
}

export enum ReasonOutStr {
    Running = 'Running',
}

export interface SplitTimeInfo {
    Sectors: Sector[];
}

export interface Sector {
    SectorNum: number;
    SectorStartPct: number;
}

export interface WeekendInfo {
    TrackName: string;
    TrackID: number;
    TrackLength: string;
    TrackLengthOfficial: string;
    TrackDisplayName: string;
    TrackDisplayShortName: string;
    TrackConfigName: string;
    TrackCity: string;
    TrackCountry: string;
    TrackAltitude: string;
    TrackLatitude: string;
    TrackLongitude: string;
    TrackNorthOffset: string;
    TrackNumTurns: number;
    TrackPitSpeedLimit: string;
    TrackType: string;
    TrackDirection: string;
    TrackWeatherType: string;
    TrackSkies: string;
    TrackSurfaceTemp: string;
    TrackAirTemp: string;
    TrackAirPressure: string;
    TrackWindVel: string;
    TrackWindDir: string;
    TrackRelativeHumidity: string;
    TrackFogLevel: TrackFogLevel;
    TrackCleanup: number;
    TrackDynamicTrack: number;
    TrackVersion: string;
    SeriesID: number;
    SeasonID: number;
    SessionID: number;
    SubSessionID: number;
    LeagueID: number;
    Official: number;
    RaceWeek: number;
    EventType: string;
    Category: string;
    SimMode: string;
    TeamRacing: number;
    MinDrivers: number;
    MaxDrivers: number;
    DCRuleSet: string;
    QualifierMustStartRace: number;
    NumCarClasses: number;
    NumCarTypes: number;
    HeatRacing: number;
    BuildType: string;
    BuildTarget: string;
    BuildVersion: string;
    WeekendOptions: WeekendOptions;
    TelemetryOptions: TelemetryOptions;
}

export interface TelemetryOptions {
    TelemetryDiskFile: string;
}

export interface WeekendOptions {
    NumStarters: number;
    StartingGrid: string;
    QualifyScoring: string;
    CourseCautions: string;
    StandingStart: number;
    ShortParadeLap: number;
    Restarts: string;
    WeatherType: string;
    Skies: string;
    WindDirection: string;
    WindSpeed: string;
    WeatherTemp: string;
    RelativeHumidity: string;
    FogLevel: TrackFogLevel;
    TimeOfDay: string;
    Date: string;
    EarthRotationSpeedupFactor: number;
    Unofficial: number;
    CommercialMode: string;
    NightMode: string;
    IsFixedSetup: number;
    StrictLapsChecking: string;
    HasOpenRegistration: number;
    HardcoreLevel: number;
    NumJokerLaps: number;
    IncidentLimit: string;
    FastRepairsLimit: number | string;
    GreenWhiteCheckeredLimit: number;
}
