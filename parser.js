/**
 * Prüft, ob eine Modbus-TCP-Antwort gültig ist, und extrahiert Werte.
 * @param {Buffer} response - Die Modbus-TCP-Antwort.
 * @param {number} expectedTransactionId - Erwartete Transaction ID.
 * @param {number} expectedFunctionCode - Erwarteter Funktionscode.
 * @returns {object} - Validierte und extrahierte Daten oder Fehlerdetails.
 */
module.exports = function validateAndParseModbusResponse(response, expectedTransactionId, expectedFunctionCode) {

    // Minimum length check (Header: 7 bytes, PDU: >= 2 bytes)
    if (response.length < 9) {
        throw new Error("Invalid response length: too short to be a valid Modbus message.");
    }

    // Extract Modbus-TCP header
    const transactionId = response.readUInt16BE(0); // Transaction Identifier
    const protocolId = response.readUInt16BE(2); // Protocol Identifier
    const length = response.readUInt16BE(4); // Length Field
    const unitId = response.readUInt8(6); // Unit Identifier

    // Validate Transaction ID (should match the expected one)
    if (transactionId !== expectedTransactionId) {
        throw new Error(`Transaction ID mismatch: expected ${expectedTransactionId}, got ${transactionId}`);
    }

    // Validate protocol ID (should always be 0x0000 for Modbus-TCP)
    if (protocolId !== 0x0000) {
        throw new Error(`Invalid Protocol ID: expected 0x0000, got 0x${protocolId.toString(16)}`);
    }

    // Validate length field
    if (response.length !== length + 6) {
        throw new Error(`Length mismatch: expected ${length + 6} bytes, got ${response.length} bytes.`);
    }

    // Extract PDU (Function Code + Data)
    const functionCode = response.readUInt8(7);

    // Check for error response (function code with MSB set)
    if ((functionCode & 0x80) !== 0) {
        const exceptionCode = response.readUInt8(8);
        throw new Error(`Modbus exception: Function Code ${functionCode & 0x7F}, Exception Code ${exceptionCode}`);
    }

    // Validate expected function code
    if (functionCode !== expectedFunctionCode) {
        throw new Error(`Unexpected Function Code: expected 0x${expectedFunctionCode.toString(16)}, got 0x${functionCode.toString(16)}`);
    }

    // Extract register data
    const byteCount = response.readUInt8(8);
    const data = Buffer.from(response.subarray(9, 9 + byteCount));

    // Parse register values (16-bit unsigned integers)
    /*
    const values = [];
    for (let i = 0; i < data.length; i += 2) {
        values.push(data.readUInt16BE(i));
    }*/

    return {
        transactionId,
        unitId,
        functionCode,
        value: data.readFloatBE(0).toFixed(2),
    };

}
