import { HyundaiService } from './base'
import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'

export class Lock extends HyundaiService {
    private shouldLock?: boolean
    private isLocked?: boolean
    name = 'Doors'
    serviceType = 'LockMechanism'

    initService(): void {
        const { LockCurrentState, LockTargetState } = this.Characteristic

        this.service
            ?.getCharacteristic(LockCurrentState)
            .on('get', (cb) => cb(null, this.lockCurrentState))

        this.service
            ?.getCharacteristic(LockTargetState)
            .on('get', (cb) => cb(null, this.lockTargetState))
            .on('set', (value, cb) => {
                this.log.debug('Lock Value', value)
                if (this.shouldLock === this.isLocked) {
                    this.shouldLock = !this.isLocked
                    if (this.shouldLock) {
                        this.log.info('Locking Vehicle')
                        this.vehicle
                            .lock()
                            .then(() => cb(null))
                            .catch((reason) => {
                                this.log.error('Lock Fail', reason)
                                cb(null)
                            })
                    } else {
                        this.log.info('Unlocking Vehicle')
                        this.vehicle
                            .unlock()
                            .then(() => cb(null))
                            .catch((reason) => {
                                this.log.error('Unlock Fail', reason)
                                cb(null)
                            })
                    }
                }
            })
    }
    setCurrentState(status: VehicleStatus): void {
        if (status.chassis.locked !== this.isLocked) {
            this.isLocked = status.chassis.locked
            this.log.info(`Vehicle is ${this.isLocked ? 'Locked' : 'Unlocked'}`)
            this.service?.updateCharacteristic(
                this.Characteristic.LockCurrentState,
                this.lockCurrentState
            )
        }
    }
    get lockCurrentState(): number {
        const { LockCurrentState } = this.Characteristic

        if (this.isLocked) {
            return LockCurrentState.SECURED
        } else if (this.isLocked === false) {
            return LockCurrentState.UNSECURED
        } else {
            return LockCurrentState.UNKNOWN
        }
    }
    get lockTargetState(): number {
        const { LockTargetState } = this.Characteristic

        return this.shouldLock
            ? LockTargetState.SECURED
            : LockTargetState.UNSECURED
    }
}
