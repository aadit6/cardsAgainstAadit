const express = require("express");

const router = express.Router();
const session = require("express-session");
const db = require("../utils/database.js")
const dir = `C:\\Users\\aadit\\Documents\\A-Levels\\CS\\NEA\\pokerGameNEA\\server`;

const ggl = require("../utils/googleAuth.js");
router.get("/auth/google", (req, res) => {
    const authUrl = ggl.getAuthUrl();
    console.log("authURL: ", authUrl);
    console.log("PORT:", process.env.PORT);

    res.redirect(authUrl);
});

router.get("/auth/google/cardsagainstaadit", (req, res) => {
    const {code} = req.query;
    console.log("Received code:", code);
    ggl.authenticateGoogleUser(code, (err, user) => {
        if (err) {
            // Handle the error case
            res.render(dir + "/views/login.ejs", { error: err, success: "" });
            return;
        } else {
            // Handle the case where the user is authenticated successfully
            console.log("User:", user);
            req.session.user = user;
            res.redirect("/menu");
        }
    })
})

module.exports = router;