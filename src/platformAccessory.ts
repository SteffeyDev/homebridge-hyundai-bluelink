import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces';
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle';
import { EventEmitter } from 'events';
import { PlatformAccessory } from 'homebridge';

import { HyundaiPlatform } from './platform';
import initServices from './services';

const REFRESH_INTERVAL = 1000 * 60 * 60; // once per hour, per https://github.com/Hacksore/bluelinky/wiki/API-Rate-Limits

export class VehicleAccessory extends EventEmitter {
  private isFetching = false;
  constructor(
    public readonly platform: HyundaiPlatform,
    public readonly accessory: PlatformAccessory,
    public readonly vehicle: Vehicle,
  ) {
    super();
    this.setInformation();
    initServices(this);
    this.fetchStatus();
    setInterval(this.fetchStatus.bind(this), REFRESH_INTERVAL);
  }

  fetchStatus(): void {
    if (!this.isFetching) {
      this.isFetching = true;
      this.vehicle
        .status({ refresh: false, parsed: true })
        .then(response => {
          this.platform.log.debug('Received status update', response);
          this.emit('update', <VehicleStatus>response);
          this.isFetching = false;
        })
        .catch(error => {
          this.platform.log.error('Status fetch error', error);
        });
    }
  }

  setInformation(): void {
    this.accessory
      ?.getService(this.platform.Service.AccessoryInformation)
      ?.setCharacteristic(this.platform.Characteristic.Manufacturer, 'Hyundai')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.accessory.context.device.name,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.accessory.context.device.vin,
      );
  }
}
