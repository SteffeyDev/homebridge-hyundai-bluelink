# Homebridge Hyundai Bluelink

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
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
        "credentials": {
            "username": "your username / email",
            "password": "your password",
            "region": "US / CA / EU",
            "pin": "your pin"
        },
        "vehicles": [
            {
                "vin": "your VIN",
                "maxRange": 500
            }
        ],
        "remoteStart": {
            "cool": false,
            "heat": false,
            "defrost": false,
            "temperature": 72,
            "igniOnDuration": 15
        },
        "platform": "Hyundai"
    }
],
```

## Known Issues

**SSL Key too Small**

Log:

```
[Hyundai] Client Error GotError [RequestError]: write EPROTO 1995553232:error:141A318A:SSL routines:tls_process_ske_dhe:dh key too small:../deps/openssl/openssl/ssl/statem/statem_clnt.c:2158:
```

Workaround: https://github.com/FreshRSS/FreshRSS/issues/3029

## Roadmap

-   [x] Lock/Unlock
-   [x] Battery/Gas Distance to Empty
-   [x] Remote Start/Stop
-   [x] Remote start options
-   [ ] Siri Support
