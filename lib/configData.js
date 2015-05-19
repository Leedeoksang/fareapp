'use strict'

var chargeData = require('../conf/chargeData.json'),
	loadType = require('../conf/load.json');

function ConfigData() {

}

ConfigData.prototype.BasicChargeFigure = function (contractType, usage) {
	var data = chargeData[contractType];

	if (contractType === 1 || contractType === 2) {
		for (var i = 0, len = data.basic.length; i < len; i += 1) {
			if (usage >= parseInt(data.basic[i].range.from) && usage <= parseInt(data.basic[i].range.to)) {
				return data.basic[i].fare;
			}
		}
	}
	else if (contractType >= 3 && contractType <= 47) {
		return data.basic;
	}
	else {
		console.log('there is no chargeData for this contractType');
	}
};

ConfigData.prototype.wattageCharge = function (contractType, season, timestamp, usage) {
	var data = chargeData[contractType],
		loadType = this.getLoadType(timestamp, season);
		
	if (contractType === 1 || contractType === 2) {
		for (var i = 0, len = data.wattage.length; i < len; i += 1) {
			if (usage >= parseInt(data.wattage[i].range.from) && usage <= parseInt(data.wattage[i].range.to)) {
				return data.wattage[i].fare;
			}
		}
	}	
	else if ((contractType >= 3 && contractType <= 7) || (contractType >= 21 && contractType <= 25) || (contractType >= 30 && contractType <= 34)) {
		return data.wattage[season];
	}
	else if ((contractType >= 8 && contractType <= 20) || (contractType >= 26 && contractType <= 29) || (contractType >= 35 && contractType <= 47)) {
		return data.wattage[season][loadType];
	}
	else {
		console.log('there is no chargeData for this contractType');
	}
};

ConfigData.prototype.getLoadType = function (timestamp, season) {
	var date = new Date(timestamp),
		hour = date.getHours(),
		loadData = loadType[season];
	
	for (var i = 0, len = loadData.light.length; i < len; i += 1) {
		if (loadData.light[i].start > loadData.light[i].end) {
			if (hour >= loadData.light[i].start || (hour >= 0 && hour < loadData.light[i].end)) {
				return 'light';
			}
		}
		else if (hour >= loadData.light[i].start && hour < loadData.light[i].end) {
			return 'light';
		}
	}

	for (var i = 0, len = loadData.middle.length; i < len; i += 1) {
		if (loadData.middle[i].start > loadData.middle[i].end) {
			if (hour >= loadData.middle[i].start || (hour >= 0 && hour < loadData.middle[i].end)) {
				return 'middle';
			}
		}
		else if (hour >= loadData.middle[i].start && hour < loadData.middle[i].end) {
			return 'middle';
		}
	}

	for (var i = 0, len = loadData.heavy.length; i < len; i += 1) {
		if (loadData.heavy[i].start > loadData.heavy[i].end) {
			if (hour >= loadData.heavy[i].start || (hour >= 0 && hour < loadData.heavy[i].end)) {
				return 'heavy';
			}
		}
		else if (hour >= loadData.heavy[i].start && hour < loadData.heavy[i].end) {
			return 'heavy';
		}
	}
};

module.exports = ConfigData;




