const mongoose = require('mongoose');
const shortId = require('shortid');

const shortURLSchema = new mongoose.Schema({
	owner: {
		type: String,
		required: true,
	},
	full: {
		type: String,
		required: true,
	},
	short: {
		type: String,
		required: true,
		default: shortId.generate,
	},
	clicks: {
		type: Number,
		required: true,
		default: 0,
	},
	createdAt: {
		type: Date,
		required: true,
	},
});

module.exports = mongoose.model('ShortURL', shortURLSchema);
