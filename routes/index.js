'use strict';

var express = require('express'),
	router = express.Router(),
	core = require('../controllers/core'),
	dbConnectedData = require('../lib/dbConnectedData'),
	fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	var testUsage = [],
		testTime = [],
		dataJson,
		totalBill,
		dbApplication = new dbConnectedData();

	fs.readFile('test1Usage.txt', 'utf8', function (error, data) {
		var previous = 0;

		for (var i = 0, len = data.length; i < len; i += 1) {
			if (data[i] === '\n') {
				testUsage.push(parseInt(data.substr(previous, i - previous)));
				previous = i + 1;
			}
		}

		fs.readFile('test1Time.txt', 'utf8', function (error, data2) {
			var previous = 0,
				dataJson = {};

			for (var i = 0, len = data2.length; i < len; i += 1) {
				if (data2[i] === '\n') {
					testTime.push(data2.substr(previous, i - previous + 1));
					previous = i + 1;
				}
			}

			dataJson.usages = [];

			for (var i = 0, len = testUsage.length; i < len; i += 1) {
				dataJson.usages.push({
					timestamp: (new Date(testTime[i])).getTime(),
					unitPeriodUsage: testUsage[i]
				});
			}
			/*
			dataJson.siteHash = '5f31166578b6a5a4f619eb9698ea2b92d781692d';
			dataJson.metering = false;
			dataJson.detaild = false;

			dataJson.contractType = 0;
			dataJson.contractPower = 0;

			totalBill = core(dataJson);
			console.log(totalBill);
			res.send(totalBill);*/
			if (req.body.contractType) {
				dataJson.contractType = req.body.contractType;
			}
			else {
				dbApplication.getContractType(dataJson.siteHash, function (error, contractType) {
					if (error) {
						console.log(error)
					}
					else {
						dataJson.contractType = contractType;
						if (req.body.contractPower) {
							dataJson.contractPower = req.body.contractPower
						}
						else {
							dbApplication.getContractPower(dataJson.siteHash, function (error, contractPower) {
								dataJson.contractPower = contractPower;
								console.log(totalBill);
								res.send(totalBill);
							});
						}
					}	
				});
			}

		});
	});
});
  // res.render('index', { title: 'Express' });

module.exports = router;
