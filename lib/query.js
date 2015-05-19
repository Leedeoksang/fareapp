'use strict';

exports.getContractTypeQuery = function (siteHash) {
	var query;

	query = 'SELECT contractType'
		+ '		FROM site A'
		+ ' 	JOIN site_hash B'
		+ ' 	ON B.site_id = A.id'
		+ ' 	AND B.hash = \'' + siteHash + '\'' + ';';

	return query;
};

exports.getSiteIdQuery = function (siteHash) {
	var query;
	
	query = 'SELECT site_id '
		+ '		FROM site_hash '
		+ '		WHERE hash = \'' + siteHash + '\''
		+ ';';

	return query;
};

exports.getContractPowerQuery = function (siteHash) {
	var query;

	query = 'SELECT A.contractPower '
		+ '		FROM billing_target A '
		+ '		JOIN site B '
		+ '		ON B.id = A.siteId '
		+ '		JOIN site_hash C '
		+ '		ON C.id = B.id '
		+ '		AND C.hash = \'' + siteHash + '\''
		+ '		WHERE A.contractType = B.contractType;';
	
	return query;
};