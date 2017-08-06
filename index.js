const express = require('express'),
    oxr = require('open-exchange-rates'),
    nodeCache = require('node-cache'),
    dateFormat = require('dateformat');
var fx = require('money');
const app = express();
const router = express.Router();
const fxCache = new nodeCache();

var qDate = dateFormat(new Date(), 'yyyy-mm-dd');


oxr.set({app_id: '2a3ffbc790a9435b94d3f219fac0a98e'});

const latest = function(){
    fx.base = oxr.base;
    fx.rates = oxr.rates;
    fx.timestamp = oxr.timestamp;
    qDate = dateFormat(new Date(fx.timestamp), 'yyyy-mm-dd');
    fxCache.set(qDate, fx, function( err, success ){
	if( !err && success ){
	    console.log( "Date : " + qDate + " save in cache!" );
	}
    });
}

const getFromCache = function(){
    var localCache = fxCache.get(qDate);
    if (localCache == undefined){
	oxr.latest(latest);
    } else {
	fx = localCache;
    }
}

oxr.latest(latest);

router.get('/latest/all', function(req, res) {
    getFromCache();
    res.json({base: fx.base, rates:fx.rates, timestamp:qDate})
});

router.get('/latest/:curr', function(req, res) {
    getFromCache();
    res.json({base: fx.base, rates:fx.rates[req.params.curr], timestamp:qDate})
});

router.get('/latest/:curr/base/:base', function(req, res) {
    var base = req.params.base;
    var curr = req.params.curr;
    getFromCache();
    var xrates = fx(1).from(base).to(curr); 
    res.json({base: base, rates:xrates, timestamp:qDate})
});

app.use('/api', router);
app.listen(3000, function() {
    console.log('Exchange rate app listening on port 3000!');
});
