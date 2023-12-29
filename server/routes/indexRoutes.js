const express = require("express");
const fs = require("fs");
const router = express.Router();
const session = require("express-session");
const dir = `C:\\Users\\aadit\\Documents\\A-Levels\\CS\\NEA\\pokerGameNEA\\server`;
const path = require("path");
const {createProxyMiddleware} = require("http-proxy-middleware");
const axios = require("axios");


console.log("dirname", __dirname);
console.log("dir", dir);

//basic "GET" routes
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect("/menu")
    } else {
        res.render(dir + "/views/login.ejs", {error:"", success:""});        
    }    
})

router.get('/signin', (req, res) => {
    res.render(dir + "/views/login.ejs", {error:"", success:""});
})

router.get('/signup', (req,res) => {
    res.render(dir + '/views/register.ejs', {error:"", success:""});
})

//router.gets after login successful (eg menu, items on navbar, logout)
router.get('/menu', async (req, res) => {
    if (!req.session.user) {
        res.redirect("/");
        return;
    } else {
        res.render(dir + "/views/menu.ejs", { username: req.session.user });
    }
});



router.get('/rules', (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
        return;
    } else {
        res.render(dir + "/views/rules.ejs", {username: req.session.user});
    }
})

router.get('/settings', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else {
        res.render(dir + '/views/settings.ejs', {error:"", success:"", username: req.session.user} );
    }
})

router.get('/leaderboard', (req, res) => { //NOT IN USE YET
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else{
        res.render(dir + "/views/leaderboard.ejs", {username:req.session.user})
    }
})

router.get('/play', (req, res) => { 
    if (!req.session.user) {
        res.redirect('/');
        return;
    } else{
        res.redirect("http://localhost:3000");

        return;

    }
})

router.get('/logout', (req, res) => {
    if(!req.session.user) {
        res.redirect('/')
        return
    } else {
        req.session.destroy();
        res.render(dir + "/views/login.ejs", { error:"", success: "Successfully logged out." });
    }
})



module.exports = router;