const express = require('express');

function logger(req, res, next) { //to log requests in console
    console.log("Request Method:", req.method)
    console.log("Request URL:", req.urlencoded)
    console.log('Request:', req.url);
    next()
}

//create some error-handling middleware

module.exports = {logger};

