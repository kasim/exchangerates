const express = require('express'),
    dateFormat = require('dateformat'),
    app = express(),
    router = express.Router();

var grates = require('./lib/get-rates.js');

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

app.listen(8080, function() {
    console.log('Exchange rate app listening on port 8080!');
});
