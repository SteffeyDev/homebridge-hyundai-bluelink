import { HyundaiService } from "./base";
import { VehicleStatus } from "bluelinky/dist/interfaces/common.interfaces";

export class Range extends HyundaiService {
  private maxRange?: number;
  private currentRange?: number;
  name = "Range";
  serviceType = "BatteryService";
  lowBatteryThreshold = 25;

  initService(): void {
    this.maxRange = this.accessory.context.device.maxRange;

    const { BatteryLevel, StatusLowBattery } = this.Characteristic;
    this.service
      ?.getCharacteristic(BatteryLevel)
      .on("get", (cb) => cb(null, this.rangePct));
  }
  setCurrentState(status: VehicleStatus): void {
    if (status.engine.range !== this.currentRange) {
      this.currentRange = status.engine.range;
      this.log.info(`new range ${this.currentRange}`);
    }
    if (!this.maxRange || this.currentRange > this.maxRange) {
      this.maxRange = this.currentRange;
      this.log.info(`maxRange is ${this.maxRange}`);
    }
  }
  get rangePct(): number {
    if (!this.maxRange) {
      return 100;
    } else if (!this.currentRange) {
      return 0;
    } else {
      return (this.currentRange / this.maxRange) * 100;
    }
  }
}
