const config = {
    // Uses environment variables for security, falls back to hardcoded strings only for local dev
    secret_jwt: process.env.SECRET_JWT || "thisismysecretjwtkeyforauthentication",
    emailUser: process.env.EMAIL_USER ,
    emailPassword: process.env.EMAIL_PASSWORD ,
    masterKey: process.env.MASTER_KEY || "fallback_secret_if_env_missing"
}

module.exports = config;