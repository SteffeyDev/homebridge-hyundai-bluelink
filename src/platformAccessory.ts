import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'
import { Vehicle } from 'bluelinky/dist/vehicles/vehicle'
import { Service, PlatformAccessory } from 'homebridge'

import { HyundaiPlatform } from './platform'
export class VehicleAccessory {
    private interval = 10 * 1000
    private status?: VehicleStatus

    constructor(
        private readonly platform: HyundaiPlatform,
        private readonly accessory: PlatformAccessory,
        private readonly vehicle: Vehicle
    ) {
        this.fetchStatus()
        this.setInformation()
        this.handleLock()

        setInterval(this.fetchStatus.bind(this), this.interval)
    }

    fetchStatus(): void {
        this.vehicle
            .status({ refresh: false, parsed: true })
            .then((response) => {
                this.status = <VehicleStatus>response
                this.platform.log.debug('status', this.status)
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

    handleLock(): void {
        const lock = this.service('lock', this.platform.Service.LockMechanism)

        lock.getCharacteristic(
            this.platform.Characteristic.LockCurrentState
        ).on('get', (cb) => {
            const lockStatus = this.status?.chassis.locked
            this.platform.log.debug('lock status', lockStatus)
            let lockValue

            if (lockStatus) {
                lockValue = this.platform.Characteristic.LockCurrentState
                    .SECURED
            } else if (lockStatus === false) {
                lockValue = this.platform.Characteristic.LockCurrentState
                    .UNSECURED
            } else {
                lockValue = this.platform.Characteristic.LockCurrentState
                    .UNKNOWN
            }
            this.platform.log.debug('lock value', lockValue)
            cb(null, lockValue)
        })
        // this.service
        //     .getCharacteristic(this.Characteristic.LockTargetState)
        //     .on('get', this.handleLockTargetStateGet.bind(this))
        //     .on('set', this.handleLockTargetStateSet.bind(this))
    }

    service(name: string, type: typeof Service): Service {
        return (
            this.accessory.getService(name) ||
            this.accessory.addService(type, name, name)
        )
    }
}
