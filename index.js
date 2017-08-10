const express = require('express'),
    nodeCache = require('node-cache'),
    dateFormat = require('dateformat'),
    Promise = require('promise'),
    app = express(),
    router = express.Router(),
    fxCache = new nodeCache();

var oxr = require('open-exchange-rates'),
    fx = require('money');

oxr.set({app_id: '2a3ffbc790a9435b94d3f219fac0a98e'});

var latest = new Promise(function (resolve, reject) {
    oxr.latest(function(err, res) {
	if (err) reject(err);
	else { 
	    fx.base = oxr.base;
	    fx.rates = oxr.rates;
	    fx.timestamp = oxr.timestamp;
	    resolve(res);
	}
    });
});

var historical = function(date) {
    return new Promise(function(resolve, reject) {
	oxr.historical(date, function(err, res) {
	    if (err) reject(err);
	    else {
		fx.base = oxr.base;
		fx.rates = oxr.rates;
		fx.timestamp = oxr.timestamp;
		resolve(res);
	    }
	});
    });    
}

function getRates(date){
    if(date === dateFormat(new Date(), 'yyyy-mm-dd')) latest.then(setCache(date));
    else  historical(date).then(setCache(date));
}

function setCache(date){
    fxCache.set(date, fx, function( err, success ){
	if( !err && success ) console.log( "Date : " + date + " save in cache!" );
    });
}

function getCache(date){
    var localCache = fxCache.get(date);
    if (localCache == undefined) getRates(date);
    else fx = localCache;
}

router.get('/latest/all', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: fx.base, rates:fx.rates, date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/latest/:curr', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: fx.base, rates:fx.rates[req.params.curr], date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/latest/:curr/base/:base', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: req.params.base, rates:fx(1).from(req.params.base).to(req.params.curr), date:dateFormat(new Date(), 'yyyy-mm-dd')});
});

router.get('/historical/:date/all', function(req, res) {
    getCache(req.params.date);
    res.json({base: fx.base, rates:fx.rates, date:req.params.date});
});

router.get('/historical/:date/:curr', function(req, res) {
    getCache(req.params.date);
    res.json({base: fx.base, rates:fx.rates[req.params.curr], date:req.params.date});
});

router.get('/historical/:date/:curr/base/:base', function(req, res) {
    getCache(req.params.date);
    res.json({base: req.params.base, rates:fx(1).from(req.params.base).to(req.params.curr), date:req.params.date});
});

app.use('/api', router);

app.listen(8080, function() {
    console.log('Exchange rate app listening on port 8080!');
});
