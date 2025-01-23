# Introduction
Plugin that read values from [SmartMeter SDM72D](https://stromzähler.eu/detail/018f100786217328872ac3efb748b9ef).

> [!IMPORTANT]  
> This plugin requires [mbusd](https://github.com/3cky/mbusd) to work.<br />
> mbusd is a bridge between RS485 & Ethernet Modbus.

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"SmartMeter SDM72D",
   "version": "1.0.0",
   "intents":[
      "devices",
      "endpoints",
      "store"
   ],
   "uuid": "add34adc-e9a9-44c5-bca3-edea9516fbaa"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-smartmeter-sdm72d/ ~/projects/OpenHaus/backend/plugins/add34adc-e9a9-44c5-bca3-edea9516fbaa/
```

# Usage
1) Install plugin
2) A dummy device with ip `127.5.5.5` gets added
3) Change the IP address to the real on
4) Change modbus slave ID
5) [OPTIONAL] Configure polling interval

> [!NOTE]  
> Manual configuration required<br />
> See "Usage" above, change IP & Modbus ID