import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces';
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle';
import { Characteristic, Logger, PlatformAccessory, Service } from 'homebridge';
import { HyundaiConfig } from '../config';
import { HyundaiPlatform } from '../platform';
import { VehicleAccessory } from '../platformAccessory';

export abstract class HyundaiService {
  protected readonly accessory: PlatformAccessory = this.va.accessory;
  protected readonly vehicle: Vehicle = this.va.vehicle;
  protected readonly platform: HyundaiPlatform = this.va.platform;
  protected readonly Characteristic: typeof Characteristic = this.platform
    .Characteristic;
  protected readonly log: Logger = this.platform.log;
  protected readonly config: HyundaiConfig = <HyundaiConfig>(
    this.platform.config
  );

  constructor(protected readonly va: VehicleAccessory) {
    this.va.on('update', this.setCurrentState.bind(this));
  }

  protected get service(): Service {
    return (
      this.accessory.getService(this.name) ||
      this.accessory.addService(
        this.platform.Service[this.serviceType],
        this.name,
        this.name,
      )
    );
  }

  abstract name: string;
  abstract serviceType: string;
  abstract initService(): void;
  abstract setCurrentState(status: VehicleStatus): void;
}
