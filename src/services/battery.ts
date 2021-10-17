import { HyundaiService } from "./base";
import { VehicleStatus } from "bluelinky/dist/interfaces/common.interfaces";

export class Battery extends HyundaiService {
  private batteryCharge?: number;
  private batteryCharging: Boolean = false;
  name = "Battery";
  serviceType = "BatteryService";
  lowBatteryThreshold = 20;

  initService(): void {
    const {
      BatteryLevel,
      ChargingState,
      StatusLowBattery,
    } = this.Characteristic;
    this.service
      ?.getCharacteristic(BatteryLevel)
      .on("get", (cb) => cb(null, this.batteryLevel));
    this.service
      ?.getCharacteristic(ChargingState)
      .on("get", (cb) => cb(null, this.chargingState));
    this.service
      ?.getCharacteristic(StatusLowBattery)
      .on("get", (cb) => cb(null, this.statusLowBattery));
  }
  setCurrentState(status: VehicleStatus): void {
    if (status.engine.batteryChargeHV !== this.batteryCharge) {
      this.batteryCharge = status.engine.batteryChargeHV;
      this.log.info(`new battery charge ${this.batteryCharge}`);
    }
    if (status.engine.charging !== this.batteryCharging) {
      this.batteryCharging = status.engine.charging ?? false;
      this.log.info(`new battery charge state ${this.batteryCharging}`);
    }
    this.service?.updateCharacteristic(
      this.Characteristic.StatusLowBattery,
      this.statusLowBattery
    );
  }

  get chargingState(): number {
    return this.batteryCharging ? 1 : 0;
  }

  get batteryLevel(): number {
    return this.batteryCharge ?? 0;
  }

  get statusLowBattery(): number {
    const { StatusLowBattery } = this.Characteristic;
    if (this.batteryLevel < this.lowBatteryThreshold) {
      return StatusLowBattery.BATTERY_LEVEL_LOW;
    } else {
      return StatusLowBattery.BATTERY_LEVEL_NORMAL;
    }
  }
}
