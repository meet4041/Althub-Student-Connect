import dotenv from 'dotenv';
dotenv.config();

const config = {
    secret_jwt: process.env.SECRET_JWT,
    secret_refresh: process.env.SECRET_REFRESH || process.env.SECRET_JWT,
    emailUser: process.env.EMAIL_USER ,
    emailPassword: process.env.EMAIL_PASSWORD ,
    clientUrl: process.env.CLIENT_URL,
    masterKey: process.env.MASTER_KEY,
};

export default config;
