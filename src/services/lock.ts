import { HyundaiService } from './base';
import { VehicleStatus } from 'bluelinky/dist/interfaces/common.interfaces';

export class Lock extends HyundaiService {
  private _shouldLock?: boolean;
  private isLocked?: boolean;
  name = 'Doors';
  serviceType = 'LockMechanism';

  initService(): void {
    const { LockCurrentState, LockTargetState } = this.Characteristic;

    this.service
      ?.getCharacteristic(LockCurrentState)
      .on('get', cb => cb(null, this.lockCurrentState));

    this.service
      ?.getCharacteristic(LockTargetState)
      .on('get', cb => cb(null, this.lockTargetState))
      .on('set', (_value, cb) => {
        if ([undefined, this.isLocked].includes(this.shouldLock)) {
          this.shouldLock = !this.isLocked;
          this.shouldLock ? this.lock(cb) : this.unlock(cb);
        } else {
          this.log.debug('isLocked', this.isLocked);
          this.log.debug('shouldLock', this.shouldLock);
        }
      });
  }
  setCurrentState(status: VehicleStatus): void {
    if (status.chassis.locked !== this.isLocked) {
      this.isLocked = status.chassis.locked;
      this.log.info(`Vehicle is ${this.isLocked ? 'Locked' : 'Unlocked'}`);
      this.service?.updateCharacteristic(
        this.Characteristic.LockCurrentState,
        this.lockCurrentState,
      );
    }
  }
  lock(cb): void {
    this.log.info('Locking Vehicle');
    this.vehicle
      .lock()
      .then(response => this.log.info('Lock Response', response))
      .catch(reason => this.log.error('Lock Fail', reason))
      .finally(() => cb(null));
  }
  unlock(cb): void {
    this.log.info('Unlocking Vehicle');
    this.vehicle
      .unlock()
      .then(response => this.log.info('Unlock Response', response))
      .catch(reason => this.log.error('Unlock Fail', reason))
      .finally(() => cb(null));
  }
  get lockCurrentState(): number {
    const { LockCurrentState } = this.Characteristic;

    if (this.isLocked) {
      return LockCurrentState.SECURED;
    } else if (this.isLocked === false) {
      return LockCurrentState.UNSECURED;
    } else {
      return LockCurrentState.UNKNOWN;
    }
  }
  get lockTargetState(): number {
    const { LockTargetState } = this.Characteristic;

    return this.shouldLock
      ? LockTargetState.SECURED
      : LockTargetState.UNSECURED;
  }
  get shouldLock(): boolean {
    return this._shouldLock === undefined ? !!this.isLocked : this._shouldLock;
  }
  set shouldLock(value: boolean) {
    this._shouldLock = value;
    // Check on status & reset after 1 minute
    setInterval(() => {
      this.va.fetchStatus();
      this._shouldLock = undefined;
    }, 1000 * 60);
  }
}
