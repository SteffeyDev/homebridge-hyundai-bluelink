import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle'
import { EventEmitter } from 'events'
import { PlatformAccessory } from 'homebridge'
import { HyundaiConfig } from './config'

import { HyundaiPlatform } from './platform'
import initServices from './services'
export class VehicleAccessory extends EventEmitter {
    private interval: number
    public status?: VehicleStatus

    constructor(
        public readonly platform: HyundaiPlatform,
        public readonly accessory: PlatformAccessory,
        public readonly vehicle: Vehicle
    ) {
        super()
        this.setInformation()
        initServices(this)
        this.interval = this.intervalFromConfig()
        this.fetchStatus()
    }
    intervalFromConfig(): number {
        return (<HyundaiConfig>this.platform.config).refreshInterval * 1000
    }

    fetchStatus(): void {
        this.vehicle
            .status({ refresh: false, parsed: true })
            .then((response) => {
                this.platform.log.debug('Received status update', response)
                this.emit('update', <VehicleStatus>response)
                setInterval(this.fetchStatus.bind(this), this.interval)
            })
            .catch((error) => {
                this.platform.log.error('Status fetch error', error)
            })
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
