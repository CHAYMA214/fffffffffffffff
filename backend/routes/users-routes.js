const express = require('express');
const { login, signup, getUsers, forgotPassword, resetPassword ,googleLogin} = require('../contollers/users-contollers');
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.get('/', getUsers);
router.post('/forgotpassword', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login/google',googleLogin);

module.exports = router;
