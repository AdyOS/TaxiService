/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    REDIS_QUEUE_KEY: 'orders:queue',

    REDIS_ORDER_KEY: 'user:orders:',

    attributes: {
        userId: {
            type: 'integer'
        },
        time: {
            type: 'integer'
        },
        coordinates: {
            type: 'Object'
        }
    },

    /**
     * Создает заказ и пуляет его в очередь
     *
     * @param userId
     * @param coordinates
     * @param time
     * @returns {Promise}
     */
    add: function(userId, coordinates, time) {
        if (time == null) {
            time = Date.now();
        }

        // создаем заказ и пуляем его в очередь сортед сетов
        return new Promise((resolve, reject) => {
            var orderResult;

            Order.create({userId, coordinates, time})
                .then(res => {
                    orderResult = res;
                    sails.log.info('user order created: ', orderResult);
                    return this.addToQueue(+time, userId);
                })
                .then(() => {
                    sails.log.info('return order:', orderResult);
                    return resolve(orderResult);
                })
                .catch(e => {
                    sails.log.info('Create order exception:', e);
                    return reject(e);
                });
        });
    },

    /**
     * Добавляет заказ в очередь
     *
     * @param time
     * @param userId
     * @returns {Promise}
     */
    addToQueue: function(time, userId) {
        sails.log.info('try to queue order');
        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    let params = [this.REDIS_QUEUE_KEY, +time, userId];

                    sails.log.info('Add order to queue:', params);

                    redis.zadd(params, (err, res) => {
                        if (err) {
                            sails.log.info('zadd error:', err);
                            return reject(err);
                        }

                        sails.log.info(`Order for ${userId} added to orders queue`);

                        return resolve(true);
                    });
                });
        });
    },

    /**
     * Создает заказ
     *
     * @param params
     * @returns {Promise}
     */
    create: function(params) {
        let {userId, coordinates, time} = params;
        return new Promise((resolve, reject) => {
            this.updateOrCreate(userId, {coordinates, time})
                .then(res => {
                    sails.log.info(`Order for userId = ${userId} created`);
                    return resolve(res);
                })
                .catch(err => {
                    sails.log.error('Cant create order for userId', userId);
                    return reject(err);
                });
        });
    },

    /**
     * Отмена заказа и возврат водителя обратно в процессинг
     *
     * @param userId
     * @returns {Promise}
     */
    cancel: function(userId) {
        return new Promise((resolve, reject) => {
            this.load(userId)
                .then(order => {
                    if (_.has(order, 'driver')) {
                        //удаляем заказ у водителя, и пуляем его обратно в процессинг
                        return Taxi.registration(order.driver.id, order.driver.coordinates);
                    }

                    return Promise.resolve();
                })
                .then(() => {
                    return this.delete(userId)
                })
                .then(() => {
                    return resolve(true);
                })
                .catch(err => {
                    return reject(err);
                })
        });
    },

    /**
     * Удаление заказа из редиса
     *
     * @param userId
     * @returns {Promise}
     */
    'delete': function(userId) {
        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    redis.del(`${this.REDIS_ORDER_KEY}${userId}`, (err, result) => {
                        if (err) {
                            sails.log.info('Cant delete order by userId', userId);
                            return reject(err);
                        }
                        sails.log.info('delete res:', result)
                        return resolve(result);
                    });
                })
        });
    },

    /**
     * Создает или обновляет текуций заказ
     *
     * @param userId
     * @param params
     * @returns {Promise.<T>}
     */
    updateOrCreate: function(userId, params) {
        var order;

        return new Promise((resolve, reject) => {
            this.load(userId)
                .then(loadedOrder => {
                    let orderInfo = params;

                    if (loadedOrder) {
                        orderInfo = _.extend(loadedOrder, orderInfo);
                    }

                    order = orderInfo;

                    return Redis.getConnection();
                })
                .then(redis => {
                    redis.set(`${this.REDIS_ORDER_KEY}${userId}`, JSON.stringify(order), (err, result) => {
                        if (err) {
                            sails.log.info('Cant store order in redis');
                            return reject(err);
                        }

                        return resolve(order);
                    });
                });
        });
    },

    /**
     * Грузим заказ по юзер id
     * @param userId
     * @returns {Promise.<T>}
     */
    load: function(userId) {
        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    redis.get(`${this.REDIS_ORDER_KEY}${userId}`, (err, result) => {
                        if (err) {
                            sails.log.info('Cant load order by userId', userId);
                            return reject(err);
                        }

                        return resolve(JSON.parse(result));
                    });
                })
        });
    },

    /**
     * Ищет заказы в промежутке от ± 2 минуты
     */
    findActiveOrders: function() {
        const timeDiff = 2 * 60000;
        const currentTime = Date.now();

        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    redis.ZRANGEBYSCORE(this.REDIS_QUEUE_KEY, currentTime - timeDiff, currentTime + timeDiff, (err, res) => {
                        if (err) {
                            return reject(err);
                        }
                        sails.log.info('Active orders list:', res);
                        return resolve(res)
                    });
                })
                .catch(e => {
                    sails.log.error('Find orders error:', e);
                    reject(e);
                })
        });
    },

    /**
     * Принятие заказа водителем
     *
     * @param userId
     * @param driver
     * @returns {Promise}
     */
    accept: function(userId, driver) {
        return new Promise((resolve, reject) => {
            this.updateOrCreate(userId, driver)
                .then(() => {
                    //удаляем водителя из процессинга
                    return Promise.all([Processing.remove(driver.id), this.removeFromQueue(userId)]);
                })
                .then(() => {
                    sails.log.info('Order for userId = ', userId, 'accepted by driveId', driver.id);
                    return resolve(true);
                })
                .catch(err => {
                    return reject(err);
                })
        })
    },

    /**
     * Убрать заказ из очедери
     *
     * @param userId
     * @returns {Promise}
     */
    removeFromQueue: function(userId) {
        return new Promise((resolve, reject) => {
            Redis.getConnection()
                .then(redis => {
                    let params = [this.REDIS_QUEUE_KEY, userId];

                    redis.zrem(params, (err, res) => {
                        if (err) {
                            sails.log.info('zrem error:', err);
                            return reject(err);
                        }

                        sails.log.info(`Order for userId = ${userId} removed from orders queue`);

                        return resolve(true);
                    });
                });
        });
    }
};

