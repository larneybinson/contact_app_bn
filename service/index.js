require('module-alias/register');

const { google } = require('googleapis');
const express = require('express')
const config = require('config');
const cors = require('cors')
const OAuth2Data = config.get("google");
const tokenService = require('./public/v1/token');
const cookieParser = require('cookie-parser');

const app = express()

const CLIENT_ID = OAuth2Data.client.id;
const CLIENT_SECRET = OAuth2Data.client.secret;
const REDIRECT_URL = OAuth2Data.client.redirect
const scopes = [
	'https://www.googleapis.com/auth/contacts.readonly',
	'https://mail.google.com/',
	'https://www.googleapis.com/auth/gmail.readonly',
	// 'https://www.googleapis.com/auth/userinfo.profile',
]

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
	// Generate an OAuth URL and redirect there
	const url = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes
	});
	res.redirect(url);
});

app.get('/auth/google/callback', (req, res) => {
	const code = req.query.code
	if (code) {
		// Get an access token based on our OAuth code
		oAuth2Client.get
		oAuth2Client.getToken(code, (err, tokens) => {
			if (err) {
				console.log('Error authenticating')
				console.log(err);
			} else {
				console.log('Successfully authenticated');
				tokenService.saveToken(tokens)
				.then((data) => {
					res.cookie("user-id", data.data);
					res.redirect(`${config.get("frontendUrl")}`);
					return data;
				})
				.catch((err) => {
					return {status: 'failed', message: 'error in saving credentials', data: null};
				})
			}
		});
	}
});

app.get('/info', async (req, res) => {
	let tokens = await tokenService.fetchToken(req.headers['user-id']);

	if(tokens == null || tokens.data == null) {
		return res.status(500).send({
			status: "failed",
			message: "internal server error",
			data: "logged out"
		});
	}
	oAuth2Client.setCredentials(tokens.data);
	let data = google.gmail({version: 'v1', auth: oAuth2Client}).users.getProfile({
		userId: "me",
		access_token: tokens.data.access_token
	});
	// let data = google.plus({version: 'v1', auth: oAuth2Client}).people.list({
	// 	userId: "people/me",
	// 	collection: ""
	// });
	return res.send(data); 
	
});

app.get('/contacts', async (req, res1) => {
	let tokens = await tokenService.fetchToken(req.headers['user-id']);

	if(tokens == null || tokens.data == null) {
		return res1.status(500).send({
			status: "failed",
			message: "internal server error",
			data: "logged out"
		});
	}
	oAuth2Client.setCredentials(tokens.data);
	const service = google.people({ version: 'v1', auth: oAuth2Client });
	let nextPageToken = req.query.nextPageToken;
	let params = {
		resourceName: 'people/me',
		pageSize: 50,
		personFields: 'names,emailAddresses,phoneNumbers,photos'
	};

	if(typeof nextPageToken != "undefined") {
		params.pageToken = nextPageToken;
	}
	service.people.connections.list(params, (err, res) => {
		if (err) {
			console.error('The API returned an error: ' + err);
			res1.status(500).send({
				status: "failed",
				message: "internal server error",
				data: err.toString()
			});
			return;
		}
		res1.send({
			status: "success",
			message: null,
			data: res.data
		});
	});
});

const port = process.env.port || 5000
app.listen(port, () => console.log(`Server running at ${port}`));