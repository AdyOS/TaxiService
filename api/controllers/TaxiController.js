/**
 * TaxiController
 *
 * @description :: Server-side logic for managing Taxis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Регистрация таксиста в сети
     *
     * @param req
     * @param res
     */
    registration: function(req, res) {
        // сохраняем или обновляем данные
        // подписываем на уведомления
        let {id, coordinates} = req.params.all();

        if (!id || !coordinates || !coordinates.lat || !coordinates.lon ) {
            sails.log.error('Bad registration request:', id, coordinates);
            return res.badRequest({id, coordinates});
        }

        Taxi.registration(id, coordinates)
            .then(function(driver) {
                sails.log.info('driver registration: ok', driver);
                res.json({response: 'ok'});
            })
            .catch(function(e) {
                sails.log.error('Exception:', e);
                res.badRequest({id, coordinates});
            });
    },

    find: function(req, res) {
        let {coordinates} = req.params.all();

        if (!coordinates || !coordinates.lat || !coordinates.lon ) {
            sails.log.error('Bad search request:', id, coordinates);
            return res.badRequest({coordinates});
        }

        Taxi.findCars(coordinates)
            .then(function(drivers) {
                sails.log.info('Drivers founded', drivers);
                res.json({response: drivers});
            })
            .catch(function(e) {
                sails.log.error('Exception:', e);
                res.badRequest({coordinates});
            });
    }
};

