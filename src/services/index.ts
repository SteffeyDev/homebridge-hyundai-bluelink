import { VehicleAccessory } from '../platformAccessory';
import { Lock } from './lock';
import { Range } from './range';
import { Ignition } from './ignition';

export default function (va: VehicleAccessory): void {
  const services = [new Lock(va), new Range(va), new Ignition(va)];
  services.forEach(s => s.initService());
}
