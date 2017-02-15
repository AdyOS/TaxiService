/**
 *
 * @author aosipov
 * @class
 */
var request = require('supertest');
var sails = require('sails');

describe('UserController', function() {

    describe('#order()', function() {
        it('should return json {response: ok}', function (done) {
            let params = {id: 1,  coordinates: {lat: 15.23412, lon: 11.2341}};

            request(sails.hooks.http.app)
                .post('/user/order')
                .send(params)
                .expect(200)
                .expect({response: 'ok'}, done);
        });
    });

    /*describe('#find()', function() {
        it('should return json {response: ok}', function (done) {
            let params = {coordinates: {lat: 10.23412, lon: 11.2341}};
            sails.log.info(done);
            request(sails.hooks.http.app)
                .post('/taxi/find')
                .send(params)
                .expect(200, done)
        });
    });
*/
});
