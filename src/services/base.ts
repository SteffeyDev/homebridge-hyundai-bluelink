import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle'
import { Characteristic, Logger, PlatformAccessory, Service } from 'homebridge'
import { HyundaiPlatform } from '../platform'
import { VehicleAccessory } from '../platformAccessory'

export abstract class HyundaiService {
    constructor(protected readonly platformAccessory: VehicleAccessory) {}
    protected get service(): Service {
        return (
            this.accessory.getService(this.name) ||
            this.accessory.addService(
                this.platform.Service[this.serviceType],
                this.name,
                this.name
            )
        )
    }
    protected get accessory(): PlatformAccessory {
        return this.platformAccessory.accessory
    }
    protected get vehicle(): Vehicle {
        return this.platformAccessory.vehicle
    }
    protected get platform(): HyundaiPlatform {
        return this.platformAccessory.platform
    }
    protected get Characteristic(): typeof Characteristic {
        return this.platform.Characteristic
    }
    protected get log(): Logger {
        return this.platform.log
    }

    abstract name: string
    abstract serviceType: string
    abstract initService(): void
    abstract setCurrentState(status: VehicleStatus): void
}
