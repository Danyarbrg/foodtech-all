module.exports = {
    app: {
        name: 'foodtech',
        version: '1.0.0',
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    api: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api',
        timeout: parseInt(process.env.API_TIMEOUT) || 50000,
        retries: parseInt(process.env.API_RETRIES) || 3
    },
    session: {
        secret: process.env.SESSION_SECRET || '12345',
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000
    }
};
