/**
 * Конфиг авторелоада
 *
 * @author aosipov
 */

module.exports.autoreload = {
    active: true,//(process && process.env && process.env.NODE_ENV && process.env.NODE_ENV == 'development'),
    usePolling: false,
    dirs: [
        "api/models",
        "api/controllers",
        "api/services",
        "config",
        "crontab",
        "responses"
    ]
};
