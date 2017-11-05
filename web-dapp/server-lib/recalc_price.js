'use strict';

const config = require('../server-config');
const logger = require('../logger');
const prelog = '[recalc_price] ';

var initialized = false;
var current_price_wei = null;
var updating = false;
var last_updated = false;

function recalc(done) {
    if (updating) {
        logger.error(prelog + 'current_price_wei is still being updated');
        return setTimeout(() => done('current_price_wei is still being updated'), 1);
    }
    updating = true;
    logger.log(prelog + 'updating current_price_wei, old value: ' + current_price_wei);

    // fake for now
    setTimeout((done) => {
        updating = false;

        var usd_per_1eth = 250 + (350-250)*Math.random(); // for tests

        logger.log(prelog + 'got exchange rate: 1 ETH = ' + usd_per_1eth + ' USD');
        current_price_wei = (new config.web3.BigNumber('1e+18')).times(config.price_us_cents).dividedBy(usd_per_1eth.toString()).dividedBy(100).ceil();
        logger.log(prelog + 'current_price_wei updated, new value: ' + current_price_wei);
        last_updated = new Date();
        return done();
    }, 500, done);
};

module.exports = {
    init: function (done) {
        if (initialized) {
            logger.log(prelog + 'already initialized');
            return setTimeout(done, 1);
        }
        logger.log(prelog + 'calculating current_price_wei for the first time');
        recalc(done);
        logger.log(prelog + 'setting price update interval: ' + config.price_upd_interval_ms);
        setInterval(() => recalc(()=>{}), config.price_upd_interval_ms);
    },
    get_price_wei: function () {
        return current_price_wei;
    },
    update_status: function () {
        return updating;
    },
    last_updated: function () {
        return last_updated;
    },
};