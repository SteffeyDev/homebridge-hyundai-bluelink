import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle'
import { EventEmitter } from 'events'
import { PlatformAccessory } from 'homebridge'
import { HyundaiConfig } from './config'

import { HyundaiPlatform } from './platform'
import initServices from './services'
export class VehicleAccessory extends EventEmitter {
    public status?: VehicleStatus

    constructor(
        public readonly platform: HyundaiPlatform,
        public readonly accessory: PlatformAccessory,
        public readonly vehicle: Vehicle
    ) {
        super()
        this.setInformation()
        initServices(this)
        setInterval(
            this.fetchStatus.bind(this),
            (<HyundaiConfig>platform.config).interval * 1000
        )
    }

    fetchStatus(): void {
        this.vehicle
            .status({ refresh: false, parsed: true })
            .then((response) => this.emit('update', <VehicleStatus>response))
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
