import { PlatformConfig } from 'homebridge'

interface AuthConfig {
    username: string
    password: string
    pin: string
    region: 'US' | 'CA' | 'EU'
}
interface VehicleConfig {
    vin: string
    maxRange?: number
}
interface StartConfig {
    cool?: boolean
    heat?: boolean
    defrost?: boolean
    temperature?: number
    igniOnDuration: number
}
export interface HyundaiConfig extends PlatformConfig {
    credentials: AuthConfig
    vehicles: VehicleConfig[]
    remoteStart: StartConfig
    interval: number
}
