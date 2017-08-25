const express = require('express'),
    dateFormat = require('dateformat'),
    app = express(),
    router = express.Router();

var grates = require('./lib/get-rates.js');

app.set('port', (process.env.PORT || 5000));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/latest/all', function(req, res) {
    grates.getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: grates.fx.base, rates:grates.fx.rates, date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/latest/:curr', function(req, res) {
    grates.getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: grates.fx.base, rates:grates.fx.rates[req.params.curr], date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/latest/:curr/base/:base', function(req, res) {
    grates.getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: req.params.base, rates:grates.fx(1).from(req.params.base).to(req.params.curr), date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/historical/:date/all', function(req, res) {
    grates.getCache(req.params.date);
    res.json({base: grates.fx.base, rates:grates.fx.rates, date:req.params.date});
});

router.get('/historical/:date/:curr', function(req, res) {
    grates.getCache(req.params.date);
    res.json({base: grates.fx.base, rates:grates.fx.rates[req.params.curr], date:req.params.date});
});

router.get('/historical/:date/:curr/base/:base', function(req, res) {
    grates.getCache(req.params.date);
    res.json({base: req.params.base, rates:grates.fx(1).from(req.params.base).to(req.params.curr), date:req.params.date});
});

app.use('/api', router);

app.listen(app.get('port'), function() {
	  console.log('Exchange rates api is running on port', app.get('port'));
});
