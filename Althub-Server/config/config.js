const config = {
    // Uses environment variables for security, falls back to hardcoded strings only for local dev
    secret_jwt: process.env.SECRET_JWT || "thisismysecretjwtkeyforauthentication",
    emailUser: process.env.EMAIL_USER || "althub.daiict@gmail.com",
    emailPassword: process.env.EMAIL_PASSWORD || "zabbqjtbuyqbkycx"
}

module.exports = config;