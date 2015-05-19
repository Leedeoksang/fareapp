'use strict';

var FareCalculator = require('../lib/fareCalculator');

module.exports = function (dataJson) {
	var Fare = new FareCalculator(dataJson);

	return Fare.getBasicCharge() + Fare.getWattageBill() + Fare.getExcessUsageCharge();
};