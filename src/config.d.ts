import { REGION } from 'bluelinky/dist/constants';
import {
  Brand,
  VehicleStartOptions,
} from 'bluelinky/dist/interfaces/common.interfaces';
import { PlatformConfig } from 'homebridge';

interface AuthConfig {
  username: string;
  password: string;
  pin: string;
  region: REGION;
  brand: Brand;
}
interface VehicleConfig {
  vin: string;
  maxRange?: number;
}
export interface HyundaiConfig extends PlatformConfig {
  credentials: AuthConfig;
  vehicles: VehicleConfig[];
  remoteStart: VehicleStartOptions;
}
