const registers = new Set();
require("./registers.js")(registers);

const fetcher = require("./fetcher.js");

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints",
        "store"
    ], async (scope, [
        C_DEVICES,
        C_ENDPOINTS,
        C_STORE
    ]) => {


        // add/find device
        C_DEVICES.found({
            labels: [
                "modbus=true",
                "type=smartmeter",
                "model=sdm72d"
            ]
        }, async (device) => {

            // feedback
            logger.debug("SmartMeter found", device);



            // add/find endpoint
            const endpoint = await new Promise((resolve) => {
                C_ENDPOINTS.found({
                    labels: [
                        "modbus=true",
                        "type=smartmeter",
                        "model=sdm72d",
                        `device=${device._id}`
                    ]
                }, (endpoint) => {

                    // feedback
                    logger.debug("Endpoint found", endpoint);

                    resolve(endpoint);

                }, (filter) => {

                    logger.debug("Endpoint not found, add one");

                    C_ENDPOINTS.add({
                        name: "SmartMeter (SDM72D)",
                        device: device._id,
                        icon: "fa-solid fa-gauge-high",
                        states: Array.from(registers).map((register) => {
                            delete register.address;
                            return register;
                        }),
                        ...filter
                    });

                });
            });


            // add/find store
            const store = await new Promise((resolve) => {
                C_STORE.found({
                    labels: [
                        "modbus=true",
                        "type=smartmeter",
                        "model=sdm72d",
                        `device=${device._id}`
                    ]
                }, (store) => {

                    // feedback
                    logger.debug("Store found", store);

                    resolve(store);

                }, (filter) => {

                    logger.debug("Store not found, add one");

                    C_STORE.add({
                        name: `SmartMeter (SDM72D)`,
                        config: [{
                            name: "Polling Interval",
                            description: "Intervall to query the device in ms",
                            type: "number",
                            key: "interval",
                            value: 5000
                        }, {
                            name: "Device ID",
                            description: "Modbus slave id",
                            type: "number",
                            key: "id",
                            value: 1
                        }],
                        ...filter
                    });

                });
            });

            // handle polling
            fetcher({ device, endpoint, store, logger, registers, C_DEVICES });


        }, (filter) => {

            // feedback
            logger.debug("SmartMeter not found, add one");

            C_DEVICES.add({
                name: "SmartMeter (SDM72D)",
                icon: "fa-solid fa-gauge-high",
                interfaces: [{
                    type: "ETHERNET",
                    description: "ModBus API",
                    settings: {
                        host: "127.5.5.5",
                        port: 502
                    }
                }],
                ...filter,
                meta: {
                    manufacturer: "eastron",
                    model: "sdm-72d"
                }
            });

        });


    });
};