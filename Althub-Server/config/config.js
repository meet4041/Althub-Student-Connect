const dotenv = require('dotenv');
dotenv.config(); // Loads the variables from .env
const config = {
    secret_jwt: process.env.SECRET_JWT,
    emailUser: process.env.EMAIL_USER ,
    emailPassword: process.env.EMAIL_PASSWORD ,
    masterKey: process.env.MASTER_KEY,
}

module.exports = config;