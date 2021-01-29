import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle'
import { Service, PlatformAccessory } from 'homebridge'

import { HyundaiPlatform } from './platform'
import { HyundaiService } from './services/base'
import { Lock } from './services/lock'
export class VehicleAccessory {
    private interval = 10 * 1000
    private services: [HyundaiService]
    public status?: VehicleStatus

    constructor(
        public readonly platform: HyundaiPlatform,
        public readonly accessory: PlatformAccessory,
        public readonly vehicle: Vehicle
    ) {
        this.setInformation()
        this.services = [new Lock(this)]
        this.services.forEach((s) => s.initService())
        setInterval(this.fetchStatus.bind(this), this.interval)
    }

    fetchStatus(): void {
        this.vehicle
            .status({ refresh: false, parsed: true })
            .then((response) =>
                this.services.forEach((s) =>
                    s.setCurrentState(<VehicleStatus>response)
                )
            )
    }

    setInformation(): void {
        this.accessory
            ?.getService(this.platform.Service.AccessoryInformation)
            ?.setCharacteristic(
                this.platform.Characteristic.Manufacturer,
                'Hyundai'
            )
            .setCharacteristic(
                this.platform.Characteristic.Model,
                this.accessory.context.device.name
            )
            .setCharacteristic(
                this.platform.Characteristic.SerialNumber,
                this.accessory.context.device.vin
            )
    }
}
