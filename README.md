# TaxiService

Simple service to order Cars

**Install**
```
$ git clone git@github.com:AdyOS/TaxiService.git
$ npm install
```

Install and run redis

Change redis config `/config/connections.js`
Example:

```
redisServer: {
        adapter: 'sails-redis',
        host: 'localhost',
        port: 32768,
        password: null,
        prefix: 'online:'
    }
```

Run `$ npm test`

**TODO**
Finish TaskOrderProcessing
