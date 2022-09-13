const express = require('express');

module.exports = app => {
  // middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.set("view engine", "ejs");
}
