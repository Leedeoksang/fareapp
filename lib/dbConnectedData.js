'use strict';

var queryExecutor = require('./query_executor'),
	queryStatement = require('./query'),
	async = require('async');

function dbConnectedData () {

}

function doQuery(query, callback) {
	queryExecutor.doQuery(query, function (error, rows) {
		if (error) {
			saveLog(query);
			console.log(error);
		}
		callback(error, rows);
	}); 
}

function saveLog(query) {
    console.log('\n\n[', new Date(), '] :\n', query);
}

/*
dbConnectedData.prototype.getPeakUsage = function (siteHash) {
	var query = queryStatement.getPeakUsageQuery(),
		result;

	result = doQuery(query);

	return result;
};//요금적용전력에 사용되는 15분 피크 가져오기
*/

dbConnectedData.prototype.getContractPower = function (siteHash, callback) {
	var query = queryStatement.getContractPowerQuery(siteHash);

	async.waterfall([
		function (done) {
			doQuery(query, function (error, rows) {
				done(error, rows);
			});
		}
	], function (error, rows) {
		if (rows.length != 0) {
			callback(error, rows[0].contractPower);
		}
		else {
			console.log('There is no contractPower');
		}
	});
};//계약전력

dbConnectedData.prototype.getSiteId = function (siteHash, callback) {
	var query = queryStatement.getSiteIdQuery(siteHash);

	async.waterfall([
		function (done) {
			doQuery(query, function (error, rows) {
				done(error, rows);
			});
		}
	], function (error, rows) {
		if (rows.length != 0) {
			callback(error, rows[0].site_id);
		}
		else {
			console.log('There is no site_id');
		}
	});
};

dbConnectedData.prototype.getContractType = function (siteHash, callback) {
	var query = queryStatement.getContractTypeQuery(siteHash);
	
	async.waterfall([
		function (done) {
			doQuery(query, function (error, rows) {
				done(error, rows);
			});
		}
	], function (error, rows) {
		if (rows.length != 0) {
			callback(error, rows[0].contractType);
		}
		else {
			console.log('There is no contractType');
		}
	});
};

module.exports = dbConnectedData;