/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Заказ такси пользователем
     *
     * @param req
     * @param res
     */
    order: function(req, res) {
        // регаем юзера, если надо
        // делаем заказ
        // пуляем в очередь
        // подписываем на уведомления
        sails.log.info('params:', req.params.all());
        let {id, coordinates, time = null} = req.params.all();

        //coordinates = {lat: 15.23412, lon: 11.2341};
        if (!id || !coordinates || !coordinates.lat || !coordinates.lon ) {
            sails.log.error('Bad user order request:', id, coordinates);
            return res.badRequest({id, coordinates});
        }
        User.registration(id, coordinates, time)
            .then(result => {
                let answer = {"response": result};

                sails.log.info('user registered, order created:', answer);
                res.json({response: 'ok'});
            })
            .catch(e => {
                sails.log.error('Exception:', e);
                res.badRequest({id, coordinates});
            });
    },

    cancelOrder: function(req, res) {

    },

    test: function(req, res) {
        Order.findActiveOrders()
            .then(result => {
                res.json({result: result});
            })
            .catch(e => {
                sails.log.info('Err:', e);
                res.json({result: 'err'})
            })
    }

};

