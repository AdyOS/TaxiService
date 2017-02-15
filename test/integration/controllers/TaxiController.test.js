/**
 * Тесты для контроллера Taxi
 *
 * @author aosipov
 */

var request = require('supertest');
var sails = require('sails');

describe('TaxiController', function() {

    describe('#registration()', function() {
        it('should return json {response: ok}', function (done) {
            let params = {id: 2,  coordinates: {lat: 15.23412, lon: 11.2341}};
            sails.log.info(done);
            request(sails.hooks.http.app)
                .post('/taxi/registration')
                .send(params)
                .expect(200)
                .expect({response: 'ok'}, done);
        });
    });

    describe('#find()', function() {
        it('should return json {response: ok}', function (done) {
            let params = {coordinates: {lat: 10.23412, lon: 11.2341}};
            sails.log.info(done);
            request(sails.hooks.http.app)
                .post('/taxi/find')
                .send(params)
                .expect(200, done)
        });
    });

});
