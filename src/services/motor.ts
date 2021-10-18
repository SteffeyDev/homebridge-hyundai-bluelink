import { HyundaiService } from './base';
import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces';

export class Motor extends HyundaiService {
  private maxRange?: number;
  private currentRange?: number;
  private batteryChargeHV?: number;
  private chargingState: number = 2; //default to NOT_CHARGEABLE
  private charging: Boolean = false;
  name = 'Motor';
  serviceType = 'BatteryService';
  lowBatteryThreshold = 25;

  initService(): void {
    this.maxRange = this.accessory.context.device.maxRange;

    const { BatteryLevel, ChargingState, StatusLowBattery } =
      this.Characteristic;
    this.service
      ?.getCharacteristic(BatteryLevel)
      .on('get', cb => cb(null, this.rangePct));
    this.service
      ?.getCharacteristic(ChargingState)
      .on('get', cb => cb(null, this.chargingState));
    this.service
      ?.getCharacteristic(StatusLowBattery)
      .on('get', cb => cb(null, this.statusLowBattery));
  }
  setCurrentState(status: VehicleStatus): void {
    if (status.engine.charging != this.charging) {
      this.charging = status.engine.charging ?? false;
      this.log.info(`new charging state ${this.charging}`);
      this.chargingState = this.charging ? 1 : 0;
    }
    if (status.engine.range !== this.currentRange) {
      this.currentRange = status.engine.range;
      this.log.info(`new range ${this.currentRange}`);
    }
    if (!this.maxRange || this.currentRange > this.maxRange) {
      this.maxRange = this.currentRange;
      this.log.info(`maxRange is ${this.maxRange}`);
    }
    if (this.batteryChargeHV !== status.engine.batteryChargeHV) {
      this.batteryChargeHV = status.engine.batteryChargeHV;
      this.log.info(`new battery charge is ${this.batteryChargeHV}`);
    }
    this.service?.updateCharacteristic(
      this.Characteristic.StatusLowBattery,
      this.statusLowBattery,
    );
  }

  get rangePct(): number {
    if (this.batteryChargeHV) {
      return this.batteryChargeHV;
    } else if (!this.maxRange) {
      return 100;
    } else if (!this.currentRange) {
      return 0;
    } else {
      return (this.currentRange / this.maxRange) * 100;
    }
  }
  get statusLowBattery(): number {
    const { StatusLowBattery } = this.Characteristic;
    if (this.rangePct < this.lowBatteryThreshold) {
      return StatusLowBattery.BATTERY_LEVEL_LOW;
    } else {
      return StatusLowBattery.BATTERY_LEVEL_NORMAL;
    }
  }
}
