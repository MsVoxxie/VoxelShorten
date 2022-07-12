function trim(str, max) {
	return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

module.exports = {
	trim: trim,
};
