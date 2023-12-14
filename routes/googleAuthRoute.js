const express = require("express");
const router = express.Router();
const session = require("express-session");
const db = require("./../utils/database.js")
const googleauth = require("./../utils/googleAuth.js");
const {GoogleAuth} = require("./../utils/googleAuth.js"); // Corrected import

const ggl = new GoogleAuth();
router.get("/auth/google", (req, res) => {
    const authUrl = ggl.getAuthUrl();
    res.redirect(authUrl);
});

router.get("/auth/google/pokergame", (req, res) => {
    const {code} = req.query;
    console.log("Received code:", code);
    ggl.authenticateGoogleUser(code, (err, user) => {
        if (err) {
            // Handle the error case
            res.render(__dirname + "/views/login.ejs", { error: err, success: "" });
            return;
        } else {
            // Handle the case where the user is authenticated successfully
            console.log("User:", user);
            req.session.user = user;
            res.redirect("/menu");
        }
    })
})