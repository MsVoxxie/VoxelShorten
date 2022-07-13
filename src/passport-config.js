const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserbyId) {
	const authenticateUser = async (username, password, done) => {
		const user = await getUserByUsername(username);
		if (user == null) {
			return done(null, false, { message: 'No user with that username' });
		}

		try {
			// Decrypt the password
			if (await bcrypt.compare(password, user.password)) {
				// If the password is correct, return the user
				return done(null, user);
			} else {
				// If the password is incorrect, return false
				return done(null, false, { message: 'Incorrect Password' });
			}
		} catch (error) {
			// If there is an error, return
			return done(error);
		}
	};

	passport.use(new localStrategy({ usernameField: 'username' }, authenticateUser));
	passport.serializeUser((user, done) => done(null, user.username));
	passport.deserializeUser((id, done) => {
		return done(null, getUserbyId(id));
	});
}

module.exports = initialize;
