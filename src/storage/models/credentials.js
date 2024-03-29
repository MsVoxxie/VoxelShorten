const mongoose = require('mongoose');

const credentialsSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		default: Date.now().toString(),
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('credentials', credentialsSchema);
