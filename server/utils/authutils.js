const crypto = require('crypto');

class HashingUtil {

    constructor() {
        if (!HashingUtil.instance) { //properly comment on this later or remove(??)
          HashingUtil.instance = this;
        }
    
        return HashingUtil.instance;
    }

    
    generateSalt(sizeInBytes, callback) { //salt helps to protect against attacks such as rainbow table attacks
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
                const hashedPassword = `${iterations}.${salt.toString('hex')}.${derivedKey.toString('hex')}`;
                callback(null, hashedPassword);
            }
        });
    }

    comparePassword(plaintextPassword, hashedPassword, callback) {
        try {
            const [storedIterations, storedSalt, storedDerivedKey] = hashedPassword.split('.');
            const iterations = parseInt(storedIterations, 10);
        

        
        
            //for development purposes
            console.log(hashedPassword);
            console.log("Iterations: ", iterations);
            console.log("Stored Salt: ",Buffer.from(storedSalt, 'hex'));
            console.log("Stored derivedKey: ", Buffer.from(storedDerivedKey, 'hex'));
            
            crypto.pbkdf2(
                plaintextPassword,
                Buffer.from(storedSalt, 'hex'),
                iterations,
                64,
                'sha256',
                (err, derivedKey) => {
                    if (err) {
                        console.log("Error hashing password during login: ", err.message);
                        callback("Server side hashing error during login. Please try again", null);
                    } else {
                        console.log("Derived key: ", derivedKey);
                        const isValid = crypto.timingSafeEqual(derivedKey, Buffer.from(storedDerivedKey, 'hex'));
                        //timingSafeEqual used to protect against timing attacks
                        if (isValid) {
                            callback(null, true);
                        } else {
                            callback("Incorrect username or password. Please try again.", false);
                        }
                    }
                }
            );
        } catch (error) {
            callback("Error reading values. Please try again.", null)
        }

    }

    validateUser(email, username, password, callback) { ///MAYBE: move this to authutils since doesnt require any database operations

        // for debugging
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Password:', password);

        var errors = [];

        if (!email || !password || !username || email.trim() === '' || password.trim() === '' || username.trim() === '') {
            errors.push("You must not leave any fields blank");
        }

        // password validation
        if (password.length < 10 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!\"£$%&*#@?]/.test(password)) {
            errors.push("The formatting of the password is incorrect. Ensure all the password complexity rules have been followed");
        }

        // email validation
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            errors.push("Your email address is invalid");
        }

        // username validation
       // username validation
        if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) {
            errors.push("Your username must not contain any special characters");
        }


        // Check if there are any validation errors
        if (errors.length > 0) {
            callback(errors.join(". "));
            return false;
        }

        // If there are no errors, callback with 'none'
        callback("");
        return true;
    }
    
}

module.exports = new HashingUtil();