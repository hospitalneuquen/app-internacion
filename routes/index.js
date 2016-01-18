var express = require('express'),
  path = require("path"),
  fs = require("fs");

module.exports = function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', 'public/app.html'));
};
