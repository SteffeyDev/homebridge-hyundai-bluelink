import { VehicleAccessory } from '../platformAccessory'
import { Lock } from './lock'
import { Range } from './range'

export default function (va: VehicleAccessory): void {
    const services = [new Lock(va), new Range(va)]
    services.forEach((s) => s.initService())
}
