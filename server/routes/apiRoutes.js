const express = require("express");
const router = express.Router();
const db = require("../utils/database.js")
// const dir = `C:\\Users\\aaditnagpal\\Documents\\A-Level Computer Science\\NEA\\pokerGameNEA\\server`;

router.post("/api/checkRoom", (req, res) => {
    console.log("Api Request started");
    const {roomCode} = req.body;
    db.checkRoomExists(roomCode, (msg, roomExists) => { //remember to update this later depending on what we're checking for
        if (roomExists) {
            res.json({
                success: true,
                message: msg
            })
        } else {
            res.json({
                success: false,
                message: msg
            })
        }
    })
})

module.exports = router;