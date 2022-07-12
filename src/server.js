const ShortURL = require('./storage/models/shortURL');
const mongoose = require('mongoose');
const express = require('express');
const moment = require('moment');
const https = require('https');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const app = express();

//Login to MongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Use ejs for templating
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Get Views
const mainView = path.join(`${__dirname}/storage/views/index.ejs`);

app.get('/', async (req, res) => {
	const shortURLS = await ShortURL.find().sort({ createdAt: -1 });
	res.render(mainView, { shortURLS: shortURLS });
});

app.post('/shortenURL', async (req, res) => {
	await ShortURL.create({ full: req.body.fullURL, createdAt: moment(Date().now).format('MMMM Do YYYY, h:mm A') });
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
