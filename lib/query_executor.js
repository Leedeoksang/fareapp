'use strict';

var config = require('../conf/config.json'),
    env = process.env.NODE_ENV || 'production',//'development',
	mysql = require('mysql'),
	connection = mysql.createConnection({
		host : config[env].rds.host,
		user : config[env].rds.username,
		password : config[env].rds.password,
		database : config[env].rds.database
	});

exports.doQuery = function (query, callback) {
	connection.query(query, function(error, results){
		callback(error, results);
	});
};