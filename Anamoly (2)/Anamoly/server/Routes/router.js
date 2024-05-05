const express = require("express");
const router = new express.Router();
const controllers = require("../controllers/userControllers");


// Routes
router.get("/user/logs",controllers.userLogs);
router.post("/user/loggedinusername", controllers.getLoggedInUserName); // Add this route

router.post("/user/register",controllers.userregister);
router.post("/user/sendotp",controllers.userOtpSend);
router.post("/user/login",controllers.userLogin);




module.exports = router;
