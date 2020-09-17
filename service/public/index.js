var route = require("express").Router();

route.use("/", function(req, res, next) {
  require(`./index.js`)(req, res, next);
});

module.exports = route;
