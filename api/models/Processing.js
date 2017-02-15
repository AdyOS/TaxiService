/**
 * Processing.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    REDIS_KEY: 'available:taxi:list',

    attributes: {},

    getKey: function() {
        return this.REDIS_KEY;
    },

    getContentKey: function() {
        return `${this.REDIS_KEY}:content`
    },

    /**
     * Добавляет водителя в модель процессинга, для поиска авто
     *
     * @param driverId
     * @param coordinates
     */
    add: function(driverId, coordinates) {
        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    let value = `${coordinates.lat}:${coordinates.lon}:${driverId}`;

                    return redis.multi()
                        .zadd(this.getKey(), 0, value)
                        .hset(this.getContentKey(), driverId, value)
                        .exec();
                })
                .then(result => {
                    sails.log.info(`Driver (${driverId}) added to taxi processing`);
                    return resolve(result);
                })
                .catch(e => {
                    sails.log.error(`Cant add driver (${driverId}) to processing`, e);
                    return reject(e);
                })
        });
    },

    /**
     * Поиск машин по заданным координатам
     *
     * @param coordinates
     */
    find: function(coordinates) {
        // дельта для поиска дистанции
        const distance = 20;
        const latMin = coordinates.lat - distance;
        const latMax = coordinates.lat + distance;
        const lonMin = coordinates.lon - distance;
        const lonMax = coordinates.lon + distance;

        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    var commands = [];
                    commands.push(this.getKey());
                    commands.push(`[${latMin}:${lonMin}`);
                    commands.push(`[${latMax}:${lonMax}`);

                    sails.log.info('seach params:', commands);

                    return new Promise((resolve, reject) => {
                        redis.ZRANGEBYLEX(commands, (err, values) => {
                            if (!err) {
                                return resolve(values || []);
                            }

                            return reject(err);
                        });
                    });
                })
                .then(values => {
                    let driverIds = _.map(values, (hashes) => {
                        let match = hashes.match(/(\d+)$/);

                        if (_.size(match)) {
                            return match.pop();
                        }
                    });

                    return Promise.resolve(driverIds);
                })
                .then(result => {
                    sails.log.info(`Find driver(s) in processing`);
                    return resolve(result);
                })
                .catch(e => {
                    sails.log.error(e);
                    return reject(e);
                })
        })
    },

    /**
     * Удалить водителя из процессинга
     *
     * @param driverId
     * @returns {Promise}
     */
    remove: function(driverId) {
        var redis;

        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redisConnection => {
                    redis = redisConnection;
                    return new Promise((res, rej) => {
                        redis.hget(this.getContentKey(), driverId, (err, result) => {
                            if (err) {
                                return rej(err);
                            }

                            return res(result)
                        });
                    })
                })
                .then((value) => {
                    return redis.multi()
                        .zrem(this.getKey(), 0, value)
                        .hdel(this.getContentKey(), driverId)
                        .exec();
                })
                .then(result => {
                    sails.log.info(`Driver (${driverId}) removed from taxi processing`);
                    return resolve(result);
                })
                .catch(e => {
                    sails.log.error(`Cant remove driver (${driverId}) from processing`, e);
                    return reject(e);
                })
        });
    }
};

