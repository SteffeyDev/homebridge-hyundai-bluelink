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
                        this.start(cb)
                    } else if (!this.shouldTurnOn && this.isOn) {
                        this.stop(cb)
                    } else {
                        this.log.debug('isOn', this.isOn)
                        this.log.debug('shouldTurnOn', this.shouldTurnOn)
                    }
                }
            })
    }
    start(cb): void {
        this.log.info('Starting Vehicle')
        this.vehicle
            .start(this.config.remoteStart)
            .then((response) => this.log.info('Start Response', response))
            .catch((reason) => this.log.error('Start Fail', reason))
            .finally(() => cb(null))
    }
    stop(cb): void {
        this.log.info('Stopping Vehicle')
        this.vehicle
            .stop()
            .then((response) => this.log.info('Stop Response', response))
            .catch((reason) => this.log.error('Stop Fail', reason))
            .finally(() => cb(null))
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
