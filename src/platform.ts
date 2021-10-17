import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import BlueLinky from 'bluelinky';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { VehicleAccessory } from './platformAccessory';
import { HyundaiConfig } from './config';

export class HyundaiPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly config: HyundaiConfig;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    config: PlatformConfig,
    public readonly api: API,
  ) {
    this.config = <HyundaiConfig>config;
    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      try {
        this.discoverDevices();
      } catch (e) {
        log.error('discoverDevices Error', e);
      }
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices(): void {
    this.log.debug('Hyundai config:', this.config);

    const client = new BlueLinky(this.config.credentials);
    client.on('ready', async () => {
      this.log.debug('Client Ready');
      for (const { vin, maxRange } of this.config.vehicles) {
        const uuid = this.api.hap.uuid.generate(vin);
        const existingAccessory = this.accessories.find(
          accessory => accessory.UUID === uuid,
        );
        this.log.debug('Fetching vehicle:', vin);
        const vehicle = client.getVehicle(vin);
        this.log.debug('Vehicle found', vehicle?.vehicleConfig);

        if (existingAccessory) {
          // the accessory already exists
          if (vehicle) {
            this.log.info(
              'Restoring existing accessory from cache:',
              existingAccessory.displayName,
            );
            // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
            // existingAccessory.context.device = device;
            // this.api.updatePlatformAccessories([existingAccessory]);
            existingAccessory.context.device = vehicle.vehicleConfig;
            existingAccessory.context.device.maxRange = maxRange;
            // create the accessory handler for the restored accessory
            // this is imported from `platformAccessory.ts`
            new VehicleAccessory(this, existingAccessory, vehicle);
            // update accessory cache with any changes to the accessory details and information
            this.api.updatePlatformAccessories([existingAccessory]);
          } else if (!vehicle) {
            // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
            // remove platform accessories when no longer present
            this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
              existingAccessory,
            ]);
            this.log.info(
              'Removing existing accessory from cache:',
              existingAccessory.displayName,
            );
          }
        } else {
          if (!vehicle) {
            this.log.warn('Vehicle not found', vin);
            continue;
          }
          // the accessory does not yet exist, so we need to create it
          this.log.info('Adding new accessory:', vehicle.nickname());

          // create a new accessory
          const accessory = new this.api.platformAccessory(
            vehicle.nickname(),
            uuid,
          );

          // store a copy of the device object in the `accessory.context`
          // the `context` property can be used to store any data about the accessory you may need
          accessory.context.device = vehicle.vehicleConfig;
          accessory.context.device.maxRange = maxRange;

          // create the accessory handler for the newly create accessory
          // this is imported from `platformAccessory.ts`
          new VehicleAccessory(this, accessory, vehicle);

          // link the accessory to your platform
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    });
    client.on('error', async err => {
      this.log.error('Client Error', err);
    });

    const uuids = (<HyundaiConfig>this.config).vehicles?.map(({ vin }) =>
      this.api.hap.uuid.generate(vin),
    );
    for (const accessory of this.accessories) {
      if (!uuids?.includes(accessory.UUID)) {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
        this.log.info(
          'Removing existing accessory from cache:',
          accessory.displayName,
        );
      }
    }
  }
}
