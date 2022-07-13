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

module.exports = {
	trim: trim,
	checkAuthenticated: checkAuthenticated,
	checkNotAuthenticated: checkNotAuthenticated,
};
