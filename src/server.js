const Credentials = require('./storage/models/credentials');
const initializePassport = require('./passport-config');
const ShortURL = require('./storage/models/shortURL');
const helpers = require('./storage/funcs/helpers');
const session = require('express-session');
const flash = require('express-flash');
const Store = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const moment = require('moment');
const https = require('https');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const app = express();

//Login to MongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

//Initialize Passport
initializePassport(
	passport,
	async (username) => await Credentials.findOne({ username: username }),
	async (id) => await Credentials.findOne({ id: id })
);

// Use ejs for templating
app.set('view engine', 'ejs');

// Set up sessions
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
			httpOnly: true,
			secure: true,
		},
		resave: false,
		saveUninitialized: false,
		store: Store.create({ mongoUrl: process.env.DATABASE_URL }),
	})
);
app.use(passport.initialize());
app.use(passport.session());

// Get Views
const views = {
	home: path.join(`${__dirname}/storage/views/index.ejs`),
	register: path.join(`${__dirname}/storage/views/register.ejs`),
	login: path.join(`${__dirname}/storage/views/login.ejs`),
};

//Home Page
app.get('/', helpers.checkAuthenticated, async (req, res) => {
	const shortURLS = await ShortURL.find({ owner: req.session.passport.user }).sort({ createdAt: -1 });
	res.render(views.home, { shortURLS, trim: helpers.trim });
});

// Login Page
app.get('/login', helpers.checkNotAuthenticated, (req, res) => {
	res.render(views.login);
});

app.post(
	'/login',
	helpers.checkNotAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true,
	})
);

//Register Page
app.get('/register', helpers.checkNotAuthenticated, (req, res) => {
	res.render(views.register);
});

app.post('/register', helpers.checkNotAuthenticated, async (req, res) => {
	try {
		const userCheck = await Credentials.exists({ username: req.body.username });
		if (userCheck) return res.send('Username already exists').status(400);
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		await Credentials.create({
			username: req.body.username,
			password: hashedPassword,
		});

		res.redirect('/login');
	} catch (error) {
		res.redirect('/register');
		console.log(error);
	}
});

// Shorten Endpoint
app.post('/shortenURL', async (req, res) => {
	await ShortURL.create({ owner: req.session.passport.user, full: req.body.fullURL, createdAt: moment(Date().now).format('MMMM Do YYYY, h:mm A') });
	res.redirect('/');
});

app.get('/:shortURL', async (req, res) => {
	const shortURL = await ShortURL.findOne({ short: req.params.shortURL });
	if (shortURL) {
		shortURL.clicks++;
		await shortURL.save();
		res.redirect(shortURL.full);
	} else {
		res.redirect('/');
	}
});

const AUTH = {
	privateKey: fs.readFileSync('/etc/letsencrypt/live/short.voxxie.me/privkey.pem', 'utf8'),
	certificate: fs.readFileSync('/etc/letsencrypt/live/short.voxxie.me/fullchain.pem', 'utf8'),
	ca: fs.readFileSync('/etc/letsencrypt/live/short.voxxie.me/chain.pem', 'utf8'),
};

https.createServer({ key: AUTH.privateKey, cert: AUTH.certificate, ca: AUTH.ca }, app).listen(process.env.PORT, () => console.log(`Server Started on port:  ${process.env.PORT}`));
