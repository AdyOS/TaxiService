/**
 * Тест модели заказов
 *
 * @author aosipov
 * @class
 */

describe('OrderModel', function() {
    var startedParams = {userId: 1, coordinates: {lat: 15.23412, lon: 11.2341}, time: Date.now()};

    describe('#add()', function() {
        it('should check add function', function(done) {
            var params = _.clone(startedParams),
                returnValue = _.omit(params, 'userId');

            Order.add(params.userId, params.coordinates, params.time)
                .then(function(results) {
                    if (!_.isEqual(results, returnValue)) {
                        throw 'Order not stored';
                    }

                    done();
                })
                .catch(done);
        });
    });

    describe('#load()', function() {
        it('should check load function', function(done) {
            var userId = startedParams.userId,
                returnValue = _.omit(startedParams, 'userId');

            Order.load(userId)
                .then(function(results) {
                    if (!_.isEqual(results, returnValue)) {
                        throw 'Order not loaded';
                    }

                    done();
                })
                .catch(done);
        });
    });

    describe('#updateOrCreate()', function() {
        it('should check updateOrCreate function', function(done) {
            var userId = startedParams.userId,
                params = {
                    driver: {
                        id: 1,
                        coordinates: {
                            lat: 15.23412,
                            lon: 11.2341
                        }
                    }
                },

                returnValue = _.extend(_.omit(startedParams, 'userId'), params);

            Order.updateOrCreate(userId, params)
                .then(function(results) {
                    if (!_.isEqual(results, returnValue)) {
                        throw 'Order not loaded';
                    }

                    done();
                })
                .catch(done);
        });
    });

    describe('#findActiveOrders()', function() {
        it('should check findActiveOrders function', function(done) {
            Order.findActiveOrders()
                .then(function(results) {
                    if(_.isEmpty(results)) {
                        throw 'Active order not found'
                    }

                    done();
                })
                .catch(done);
        });
    });

    describe('#accept()', function() {
        it('should check accept function', function(done) {
            var userId = startedParams.userId,
                params = {
                    driver: {
                        id: 1,
                        coordinates: {
                            lat: 15.23412,
                            lon: 11.2341
                        }
                    }
                };

            Order.accept(userId, params.driver)
                .then(function(results) {
                    if(!results) {
                        throw 'Cant accept order'
                    }

                    done();
                })
                .catch(done);
        });
    });

    describe('#cancel()', function() {
        it('should check cancel function', function(done) {
            var userId = startedParams.userId,
                returnValue = true;

            Order.cancel(userId)
                .then(function(results) {
                    if (!_.isEqual(results, returnValue)) {
                        throw 'Order not canceled';
                    }

                    done();
                })
                .catch(done);
        });
    });
});
