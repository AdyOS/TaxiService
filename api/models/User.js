/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        coordinates: {
            type: 'Object'
        }
    },

    /**
     * Регистрация юзера
     *
     * @param id
     * @param coordinates
     * @param time
     */
    registration: function(id, coordinates, time) {
        return new Promise((resolve, reject) => {
            User.findOrCreate(id, coordinates)
                .then(user => {
                    sails.log.info('user info:', user);
                    return Order.add(id, coordinates, time);
                })
                .then((order) => {
                    sails.log.info('return order status', order);
                    return resolve(order);
                })
                .catch(e => {
                    return reject(e);
                });
        });
    }
};

