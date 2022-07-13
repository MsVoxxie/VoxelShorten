const moment = require('moment');

function trim(str, max) {
	return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
}

function humanDate(date) {
	return moment(date).format('MMMM Do YYYY, h:mm A');
}

module.exports = {
	trim: trim,
	humanDate: humanDate,
	checkAuthenticated: checkAuthenticated,
	checkNotAuthenticated: checkNotAuthenticated,
};
