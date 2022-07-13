const mongoose = require('mongoose');

const credentialsSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		default: Date.now().toString(),
	},
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('credentials', credentialsSchema);
