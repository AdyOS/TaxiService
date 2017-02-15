/**
 * Taxi.js
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
     * Регистрация водителя
     *
     * @param id
     * @param coordinates
     */
    registration: function(id, coordinates) {
        return new Promise((resolve, reject) => {
            Taxi.findOrCreate(id, coordinates)
                .then(driver => {
                    sails.log.info('Try remove driver');
                    return Processing.remove(id);
                })
                .then(() => {
                    return Processing.add(id, coordinates);
                })
                .then(() =>{
                    return resolve();
                })
                .catch(e => {
                    return reject(e);
                });
        });
    },

    findCars: function(coordinates) {
        return Processing.find(coordinates);
    }
};

