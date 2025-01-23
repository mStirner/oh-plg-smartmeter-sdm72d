module.exports = (registers) => {

    /**
     * Voltage
     */

    registers.add({
        name: "L1 Voltage",
        alias: "VOLTAGE_L1",
        type: "number",
        max: 250,
        address: Buffer.from([0x00, 0x00])
    });

    registers.add({
        name: "L2 Voltage",
        alias: "VOLTAGE_L2",
        type: "number",
        max: 250,
        address: Buffer.from([0x00, 0x02])
    });

    registers.add({
        name: "L3 Voltage",
        alias: "VOLTAGE_L3",
        type: "number",
        max: 250,
        address: Buffer.from([0x00, 0x04])
    });


    /**
     * Ampere
     */

    registers.add({
        name: "L1 Ampere",
        alias: "CURRENT_L1",
        type: "number",
        max: 16,
        address: Buffer.from([0x00, 0x06])
    });

    registers.add({
        name: "L2 Ampere",
        alias: "CURRENT_L2",
        type: "number",
        max: 16,
        address: Buffer.from([0x00, 0x08])
    });

    registers.add({
        name: "L3 Ampere",
        alias: "CURRENT_L3",
        type: "number",
        max: 16,
        address: Buffer.from([0x00, 0x0A])
    });


    /**
     * Watt
     */

    registers.add({
        name: "L1 Power",
        alias: "POWER_L1",
        type: "number",
        max: 3680, // 230V * 16A = 3680W
        address: Buffer.from([0x00, 0x12])
    });

    registers.add({
        name: "L2 Power",
        alias: "POWER_L2",
        type: "number",
        max: 3680, // 230V * 16A = 3680W
        address: Buffer.from([0x00, 0x14])
    });

    registers.add({
        name: "L3 Power",
        alias: "POWER_L3",
        type: "number",
        max: 3680, // 230V * 16A = 3680W
        address: Buffer.from([0x00, 0x16])
    });


    /**
     * Misc
     */

    registers.add({
        name: "Sum of L1/L2/L3 currents",
        alias: "CURRENT_SUM",
        type: "number",
        max: Number.MAX_SAFE_INTEGER,
        address: Buffer.from([0x00, 0x30])
    });

    registers.add({
        name: "Total system power",
        alias: "POWER_TOTAL",
        type: "number",
        max: Number.MAX_SAFE_INTEGER,
        address: Buffer.from([0x00, 0x34]),
        invert: true
    });

    registers.add({
        name: "Frequency",
        alias: "FREQUENZ",
        type: "number",
        max: 60,
        address: Buffer.from([0x00, 0x46]),
    });

    registers.add({
        name: "Total active Energy",
        alias: "ENERGY_TOTAL",
        type: "number",
        max: Number.MAX_SAFE_INTEGER,
        address: Buffer.from([0x01, 0x56])
    });

};