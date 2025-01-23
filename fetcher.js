const infinity = require("../../helper/infinity.js");
const debounce = require("../../helper/debounce.js");
const parser = require("./parser.js");

module.exports = ({ device, endpoint, store, logger, registers, C_DEVICES }) => {

    let interval = null;
    let init = null;
    let stream = null;

    // TODO: how to react on updates here?
    // - device update/ip changes
    // - store changes event emitter leak

    store.changes().once("changed", (key, value) => {

        logger.debug(`store variable changed ${key}=${value}`);

        stream.end();

        init();

    });

    C_DEVICES.events.on("update", ({ _id }) => {
        if (_id === device._id) {

            logger.debug("Device updated, re-init");

            stream.end();

            init();

        }
    });

    let worker = debounce((redo) => {

        init = redo;

        // clear prevous interval
        clearInterval(interval);

        let iface = device.interfaces[0];
        let { host, port } = iface.settings;
        stream = iface.bridge();
        let config = store.lean();
        let transactionId = 1;


        stream.on("error", (err) => {

            logger.error(err, `Could not connect to device tcp://${host}:${port}`);

            redo();

        });

        stream.once("open", () => {
            logger.debug(`Connect to tcp://${host}:${port}`);
        });

        stream.once("close", () => {
            logger.warn(`Disconnected from tcp://${host}:${port}`);
            redo();
        });

        interval = setInterval(() => {

            logger.verbose(`Query modbus device tcp://${host}:${port}`, config.id);


            let wrapper = (register, transactionId) => {
                return new Promise((resolve, reject) => {


                    // Modbus PDU (Function Code + Data)
                    const pdu = Buffer.from([
                        0x04,                // Function Code (Read Input Registers)
                        ...register.address, // Start Address (2 Bytes)
                        0x00, 0x02           // Quantity of Registers (2 Bytes)
                    ]);

                    // Modbus-TCP Header
                    const transactionIdBuffer = Buffer.alloc(2);
                    transactionIdBuffer.writeUInt16BE(transactionId); // Transaction Identifier

                    const protocolIdBuffer = Buffer.from([0x00, 0x00]); // Protocol Identifier (always 0x0000)
                    const lengthBuffer = Buffer.alloc(2);
                    lengthBuffer.writeUInt16BE(pdu.length + 1); // Length (Unit Identifier + PDU)

                    const unitIdBuffer = Buffer.from([config.id]); // Unit Identifier (Slave Address)

                    // Full Modbus-TCP Message
                    const message = Buffer.concat([
                        transactionIdBuffer,
                        protocolIdBuffer,
                        lengthBuffer,
                        unitIdBuffer,
                        pdu
                    ]);


                    stream.write(message, (err) => {
                        if (err) {

                            reject(err);

                        } else {

                            stream.once("data", (chunk) => {
                                resolve({
                                    request: message,
                                    response: chunk,
                                    transactionId,
                                    register
                                });
                            });

                        }
                    });
                });
            };

            // Verwende den `transactionId` direkt im `wrapper`-Aufruf
            let queries = Array.from(registers).reduce((chain, register) => {
                return chain.then((results) => {
                    return new Promise((resolve) => {

                        // Wait 100ms between queries
                        setTimeout(resolve, 100);
                        //resolve();

                    }).then(() => {

                        // Query register, gebe den `transactionId` mit
                        return wrapper(register, transactionId);

                    }).then((obj) => {

                        // Save result
                        results.push(obj);

                        // Transaction ID inkrementieren, mit Überlauf auf 0xFFFF
                        transactionId = (transactionId + 1) & 0xFFFF;

                        return results;

                    });
                });
            }, Promise.resolve([]));



            queries.then((values) => {
                return values.map(({ register, request, response, transactionId }) => {
                    return {
                        ...parser(response, transactionId, 0x04),
                        ...register
                    };
                });
            }).then((values) => {


                // set state values
                values.forEach(({ alias, value }, i) => {
                    if (endpoint.states[i].alias === alias) {
                        endpoint.states[i].value = Number(value);
                    }
                });

                logger.verbose("States values updated", values.map(({ alias, value }) => {
                    return `${alias}=${value}`;
                }));


            }).catch((err) => {
                logger.error(err, `Could not query registers from tcp://${host}:${port}`);
                redo();
            });

        }, config.interval);

    }, 1000);

    infinity(worker, 5000);

};