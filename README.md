# Homebridge Hyundai Bluelink

[![npm version](https://badge.fury.io/js/homebridge-hyundai-bluelink.svg)](https://badge.fury.io/js/homebridge-hyundai-bluelink)
![Build Status)](https://img.shields.io/github/workflow/status/athal7/homebridge-hyundai-bluelink/build/main)

This is a Homebridge platform plugin that uses [bluelinky](https://github.com/Hacksore/bluelinky) to communicate with the Hyundai Bluelink API.

## Installation

1. Install homebridge: `npm install -g homebridge`
2. Install this plug-in: `npm install -g homebridge-hyundai-bluelink`
3. Update your configuration file. See example config.json snippet below.

## Configuration

```json
"platforms": [
    {
        "username": "your username / email",
        "password": "your password",
        "region": "US"| "CA" | "EU",
        "pin": "your pin",
        "vehicles": [
            "your VIN"
        ],
        "platform": "Hyundai"
    }
],
```

## Roadmap

-   [x] Lock/Unlock
-   [x] Battery/Gas Distance to Empty
-   [x] Remote Start/Stop
-   [ ] Siri Support
