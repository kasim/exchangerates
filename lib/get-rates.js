(function(){
    var grates = {};

    const nodeCache = require('node-cache');
    grates.dateFormat = require('dateformat');
    grates.Promise = require('promise');
    grates.fxCache = new nodeCache();

    grates.oxr = require('open-exchange-rates'),
    grates.fx = require('money');

    grates.oxr.set({app_id: '2a3ffbc790a9435b94d3f219fac0a98e'});

    grates.latest = new Promise(function (resolve, reject) {
	grates.oxr.latest(function(err, res) {
	    if (err) reject(err);
	    else { 
		grates.fx.base = grates.oxr.base;
		grates.fx.rates = grates.oxr.rates;
		grates.fx.timestamp = grates.oxr.timestamp;
		resolve(res);
	    }
	});
    });

    grates.historical = function(date) {
	return new Promise(function(resolve, reject) {
	    grates.oxr.historical(date, function(err, res) {
		if (err) reject(err);
		else {
		    grates.fx.base = grates.oxr.base;
		    grates.fx.rates = grates.oxr.rates;
		    grates.fx.timestamp = grates.oxr.timestamp;
		    resolve(res);
		}
	    });
	});    
    }

    grates.getRates = function(date){
	if(date === grates.dateFormat(new Date(), 'yyyy-mm-dd')) grates.latest.then(grates.setCache(date));
	else grates.historical(date).then(grates.setCache(date));
    }

    grates.setCache = function(date){
	grates.fxCache.set(date, grates.fx.rates, function( err, success ){
	    if( !err && success ) console.log( 'Date : ' + date + ' save in cache!' );
	});
    }

    grates.getCache = function(date){
	var cacheRates = grates.fxCache.get(date);
	if (cacheRates == undefined) {
	    grates.getRates(date);
	    console.log('No cache, get rates from oxr!');
	} else { 
	    grates.fx.rates = cacheRates;
	    grates.fx.timestamp = date;
	    grates.fx.base = 'USD';
	    console.log('Has cache, get rates from cache!');
	}
	return grates;
    }

    module.exports = grates;
}())
