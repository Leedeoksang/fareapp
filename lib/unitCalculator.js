'use strict';

exports.toKW = function (upu, fixed) {
	var divider = 1000000,
        fixed = fixed || 0,
        kW = (upu / divider).toFixed(fixed);

    if (fixed) {
        return parseFloat(kW);
    } else {
        return parseInt(kW, 10);
    }
};