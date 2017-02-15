/**
 * Сервис для работы с нативным редисом
 *
 * @author aosipov
 * @class
 */

module.exports = {
    /**
     * Получает коннект к редису на основе драйвера модели
     *
     * @returns {Promise}
     */
    getConnection: function() {
        return new Promise(function(resolve, reject) {
            Taxi.native((err, redis) => {
                if (err) {
                    sails.log.error('Redis connection error', e);
                    return reject(e);
                }

                return resolve(redis);
            });

        });
    }
};
