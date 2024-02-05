const express = require("express");
const router = express.Router();
const session = require("express-session");
const db = require("../utils/database.js")
const auth = require("../utils/authutils.js");
const dir = `C:\\Users\\aadit\\Documents\\A-Levels\\CS\\NEA\\pokerGameNEA\\server`;


//router.post for settings => to alter account details 
router.post('/settingsupdate', (req, res) => {
    const {newUsername, oldPassword, newPassword} = req.body;
    if (newUsername === "" && newPassword === "") {
        res.render(dir + "/views/settings.ejs", {error:"One of the username or password must be changed", success:"", username:req.session.user})
        return;
    } else {     //validates either user/password/both depending on which values in form are filled
        auth.validateUser("placeholder@placeholder.com", newUsername, newPassword, (err) => {
            if(err) {
                res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user})
                return;
            }
        })
    } 
    db.getPass(req.session.user, (err, passHash) => {
        if(err) {
            res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
            return;
        } else {
            auth.comparePassword(oldPassword, passHash, (err, isValid) => {
                if(err) {
                    res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
                } else if (!isValid) {
                    res.render(dir + "/views/settings.ejs", {error: err, success:"", username:req.session.user});
                }
            })
        }
        if(newPassword != oldPassword) {
            auth.generateSalt(64, (err, salt) => {
                if(err) {
                    res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
                    return;
                } else {
                    auth.hashPassword(newPassword, salt, 10000, (err, passwordHash) => {
                        if(err) {
                            res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
                            return;
                        } else {
                            db.updatePass(req.session.user, passwordHash, (error) => {
                                if(error) {
                                    res.render(dir + "/views/settings.ejs", {error:error, success:"", username:req.session.user});
                                    return;
                                }
                            }  )
                        }
                    })
                }
            } ) 
        }
        if(newUsername != req.session.user) {
            db.checkUser(newUsername, null, (err, userAvailable) => {
                if(err) {
                    res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
                    return;
                } else if (userAvailable) {
                    db.updateUsername(req.session.user, newUsername, (err, result) => {
                        if(err) {
                            res.render(dir + "/views/settings.ejs", {error:err, success:"", username:req.session.user});
                        } else{
                            console.log("username updated");
                            req.session.user = newUsername;
                            res.render(dir + "/views/settings.ejs", {error:"", success:result, username:req.session.user});
                        }
                    })
                }
            } )
        } else {
            res.render(dir + "/views/settings.ejs", {error:"",success:"Successfully updated info!", username:req.session.user});
        }
    })
})

module.exports = router;