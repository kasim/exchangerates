const express = require('express'),
    oxr = require('open-exchange-rates'),
    nodeCache = require('node-cache'),
    dateFormat = require('dateformat'),
    Promise = require('promise');

var fx = require('money');
const app = express();
const router = express.Router();
const fxCache = new nodeCache();

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

function setHistorical(date){
    historical(date).then(setCache(date));
}

function setLatest(date){
    latest.then(setCache(date));
}

function setCache(date){
    fxCache.set(date, fx, function( err, success ){
	if( !err && success ) console.log( "Date : " + date + " save in cache!" );
    });
}

function getCache(date){
    var localCache = fxCache.get(date);
    if (localCache == undefined) setLatest(date);
    else fx = localCache;
}


router.get('/latest/all', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: fx.base, rates:fx.rates, timestamp:dateFormat(new Date(), 'yyyy-mm-dd')})
});

router.get('/latest/:curr', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: fx.base, rates:fx.rates[req.params.curr], timestamp:dateFormat(new Date(), 'yyyy-mm-dd')})
});

router.get('/latest/:curr/base/:base', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: req.params.base, rates:fx(1).from(req.params.base).to(req.params.curr), timestamp:dateFormat(new Date(), 'yyyy-mm-dd')})
});

router.get('/historical/:date/all', function(req, res) {
    getCache(req.params.date);
    res.json({base: fx.base, rates:fx.rates, timestamp:req.params.date})
});

router.get('/historical/:date/:curr', function(req, res) {
    getCache(req.params.date);
    res.json({base: fx.base, rates:fx.rates[req.params.curr], timestamp:req.params.date})
});

router.get('/latest/:curr/base/:base', function(req, res) {
    getCache(dateFormat(new Date(), 'yyyy-mm-dd'));
    res.json({base: req.params.base, rates:fx(1).from(req.params.base).to(req.params.curr), timestamp:dateFormat(new Date(), 'yyyy-mm-dd')})
});

app.use('/api', router);

app.listen(3000, function() {
    console.log('Exchange rate app listening on port 3000!');
});
