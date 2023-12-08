const crypto = require('crypto');

class HashingUtil {

    constructor() {

    }

    generateSalt(sizeInBytes, callback) {
        crypto.randomBytes(sizeInBytes, (err, salt) => {
            if (err) {
                console.error('Error generating salt:', err.message);
                callback('Server side salt generation error. Please try again', null);
            } else {
                callback(null, salt);
            }
        });
    }

    hashPassword(password, salt, iterations, callback) {
        const keylen = 64;
        crypto.pbkdf2(password, salt, iterations, keylen, 'sha256', (err, derivedKey) => {
            if (err) {
                console.error('Error hashing password:', err.message);
                callback('Server side hashing error. Please try again', null);
            } else {
                const hashedPassword = `${iterations}.${salt}.${derivedKey.toString('hex')}`;
                callback(null, hashedPassword);
            }
        });
    }

}

module.exports = {HashingUtil};