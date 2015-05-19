'use strict';

var ConfigData = require('../lib/configData'),
	dbConnectedData = require('../lib/dbConnectedData'),
	UnitCalculator = require('../lib/unitCalculator');

function FareCalculator(dataJson) {
	var date,
		totalUsage = 0,
		dbApplication = new dbConnectedData();

	this.usages = dataJson.usages;
	for (var i = 0, len = this.usages.length; i < len; i += 1) {
		totalUsage += this.usages[i].unitPeriodUsage;
	}
	this.totalUsage = totalUsage;
	date = new Date(this.usages[this.usages.length - 1].timestamp);
	this.month = date.getMonth() + 1;
	this.year = date.getYear();
	this.siteHash = dataJson.siteHash;
	this.contractType = dataJson.contractType;
	this.contractPower = dataJson.contractPower;

	if (dataJson.metering) {
		this.metering = dataJson.metering;
		if ((this.contractType >= 8 && this.contractType <= 11) || (this.contractType >= 35 && this.contractType <= 38) || (this.contractType >= 12 && this.contractType <= 20) || (this.contractType >= 26 && this.contractType <= 29) || (this.contractType >= 39 && this.contractType <= 47)) {
			this.metering = true;
			this.detailed = true;
		}
	}
	else {
		this.metering = false;
		this.detailed = false;
	}
	if (dataJson.peakData) {
		this.detailed = true;
		this.peakData = dataJson.peakData;
	}
	else {
		this.detailed = false;
	}
}

FareCalculator.prototype.getBasicCharge = function (callback) {
	var configClass = new ConfigData(),
		dbApplication = new dbConnectedData(),
		feeApplication,
		basicFigure,
		totalUsage,
		houseRange,
		basicCharge = 0;

	if (this.contractType === 1 || this.contractType === 2) {
		totalUsage = UnitCalculator.toKW(this.totalUsage);
		houseRange = [totalUsage / 100, totalUsage % 100];

		for (var i = 0; i <= houseRange[0]; i += 1) {
			if (i < houseRange[0]) {
				basicCharge += 100 * (i + 1) * configClass.BasicChargeFigure(this.contractType, ((100 * (i + 1)) - 50));
			}
			else if (i === houseRange[0]) {
				basicCharge += (totalUsage - 100 * houseRange[0]) * configClass.BasicChargeFigure(this.contractType, ((100 * (i + 1)) - 50));
			}
		}
	}
	else {
		basicFigure = configClass.BasicChargeFigure(this.contractType, UnitCalculator.toKW(this.totalUsage, 2));
		feeApplication = feeApplicationPower(this.metering, this.detailed, this.siteHash, this.month, this.contractPower, this.year, this.peakData);
		basicCharge = basicFigure * feeApplication;
	}
	return basicCharge;
	//총 기본요금 = 요금적용전력 * 1kWh당 기본요금
			
	//});
}; 

FareCalculator.prototype.getExcessUsageCharge = function (callback) {
	var feeApplication = feeApplicationPower(this.metering, this.detailed, this.siteHash, this.month, this.contractPower, this.year, this.peakData),
		dbApplication = new dbConnectedData(),
		configClass = new ConfigData();

	if (feeApplication > this.contractPower) {
		return (feeApplication - this.contractPower) * configClass.BasicChargeFigure(this.contractType, UnitCalculator.toKW(this.totalUsage, 2)) * (150 / 100);
	}
	else {
		return 0;
	}

};//초과사용부담금 -> 추후 세세한 개발 예정

function feeApplicationPower (metering, detailed, siteHash, month, contractPower, year, peakData) {
	var configClass = new ConfigData(),
		dbApplication = new dbConnectedData(),
		feeApplication,
		peak = 0;

	if (metering === false) {
		feeApplication = contractPower;
	}// 요금적용전력 = 계약전력
	else if (metering === true) {
		//feeApplication = configClass.wattageCharge();
		//feeApplication = getFeeApplicationPower(month);
		if (detailed === false) {
			feeApplication = contractPower * (0.3);
		}
		else {
			for (var i = month - 1, len = peakData[year - 1].length; i < len; i += 1) {
				if (peak < peakData[year - 1][i]) {
					peak = peakData[year - 1][i];
				}
			}
			for (var i = 0, len = month - 1; i < len; i += 1) {
				if (peak < peakData[year][i]) {
					peak = peakData[year];
				}
			}

			if (peak * 4 > contractPower) {
				return peak * 4;
			}
			else {
				return contractPower * 0.3;
			}
		}
	}// 요금적용전력 구하는 logic
		// 15 분 피크를 구하는 것이 불가능하여 계약전력 * 0.3으로 우선 대체

	return feeApplication;
};// 요금적용전력

FareCalculator.prototype.getWattageBill = function () {
	var configClass = new ConfigData(),
		wattageBill = 0,
		season,
		contractType,
		dbApplication = new dbConnectedData(),
		usages = this.usages,
		temp;

	for (var i = 0, len = usages.length; i < len; i += 1) {
		season = getSeason(usages[i].timestamp);
		wattageBill += (configClass.wattageCharge(this.contractType, season, this.usages[i].timestamp, UnitCalculator.toKW(this.usages[i].unitPeriodUsage, 2)) * UnitCalculator.toKW(this.usages[i].unitPeriodUsage, 2));
	}

	return wattageBill;
};//전력량 요금

FareCalculator.prototype.getTotalBill = function () {
	
	return this.getBasicCharge() + this.getWattageBill();
};

function getSeason (timestamp) {
	var date = new Date(timestamp),
		month = date.getMonth() + 1;

	if (month >= 11 && month < 3) {
		return 'winter';
	}
	else if (month >= 3 && month < 6) {
		return 'spring';
	} 
	else if (month >= 9 && month < 11) {
		return 'autumn';
	}
	else if (month >= 6 && month < 9) {
		return 'summer';
	}
}

module.exports = FareCalculator;