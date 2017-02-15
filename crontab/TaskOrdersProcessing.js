/**
 * Разбор очереди заказов
 *
 * @author aosipov
 * @class
 */
module.exports.crontab = {

    run: function() {
        //проверяем очередь заказов
        //todo: дописать очередь заказов

        /*Order.findActiveOrders()
            .then(orders => {
                if (_.size(orders)) {
                    return Promise.reject('Empty orders queue');
                }

                let orderIds = _.map(orders, orderId => {
                    return Order.load(orderId);
                });

                return Promise.all(orderIds);
            })
            .then(orders => {
                let cars = [];

                _.each(orders, order => {
                    cars[order.userId] = Taxi.find(order.coordinates);
                });

                return Promise.all(cars);
            })
            .then()*/
    }
};
