import { VehicleAccessory } from '../platformAccessory';
import { Lock } from './lock';
import { Motor } from './motor';
import { Ignition } from './ignition';

export default function (va: VehicleAccessory): void {
  const services = [new Lock(va), new Motor(va), new Ignition(va)];
  services.forEach(s => s.initService());
}
