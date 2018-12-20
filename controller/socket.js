const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.locals.title = "Socket.IO";
    res.render('socket');
});

module.exports = router;