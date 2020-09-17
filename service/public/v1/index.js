const route = require("express").Router();
const signInService = require('./signin');
// const {validate} = require("@api-schema-validator");


route.get('/', (req, res) => {
  signInService.signIn(req, res); 
});

app.get('/auth/google/callback', function (req, res) {
    signInService.authCallback(req, res);
});

module.exports = route;
