import { VehicleAccessory } from "../platformAccessory";
import { Lock } from "./lock";
import { Range } from "./range";
import { Ignition } from "./ignition";
import { Battery } from "./battery";

export default function (va: VehicleAccessory): void {
  const services = [
    new Lock(va),
    new Range(va),
    new Ignition(va),
    new Battery(va),
  ];
  services.forEach((s) => s.initService());
}
