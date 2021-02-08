import { HyundaiService } from './base'
import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces'

export class Ignition extends HyundaiService {
    private isOn?: boolean
    private shouldTurnOn?: boolean
    name = 'Ignition'
    serviceType = 'Switch'

    initService(): void {
        const { On } = this.Characteristic
        this.service
            ?.getCharacteristic(On)
            .on('get', (cb) => cb(null, this.isOn))
            .on('set', (value, cb) => {
                if (this.shouldTurnOn !== value) {
                    this.shouldTurnOn = value
                    if (this.shouldTurnOn && !this.isOn) {
                        this.log.info('Starting Vehicle')
                        this.vehicle
                            .start(this.config.remoteStart)
                            .then(() => cb(null))
                            .catch((reason) => {
                                this.log.error('Start Fail', reason)
                                cb(null)
                            })
                    } else if (!this.shouldTurnOn && this.isOn) {
                        this.log.info('Stopping Vehicle')
                        this.vehicle
                            .stop()
                            .then(() => cb(null))
                            .catch((reason) => {
                                this.log.error('Stop Fail', reason)
                                cb(null)
                            })
                    }
                }
            })
    }
    setCurrentState(status: VehicleStatus): void {
        if (status.engine.ignition !== this.isOn) {
            this.isOn = status.engine.ignition
            this.shouldTurnOn = this.isOn
            this.log.info(`Vehicle is ${this.isOn ? 'On' : 'Off'}`)
            this.service?.updateCharacteristic(
                this.Characteristic.On,
                this.isOn
            )
        }
    }
}
