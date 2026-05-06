const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const sendEmail = require('../util/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = async (req, res, next) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, email, name } = ticket.getPayload();

    if (!email_verified) return res.status(400).json({ message: 'Email not verified by Google' });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, password: crypto.randomBytes(20).toString('hex') });
      await user.save();
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.status(200).json({ user: user.toObject({ getters: true }), token });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(500).json({ message: 'Google login failed' });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users: users.map(u => u.toObject({ getters: true })) });
  } catch (err) {
    next(new HttpError('Fetching users failed.', 500));
  }
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs.', 422));

  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new HttpError('User already exists.', 422));

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.status(201).json({ user: user.toObject({ getters: true }), token });
  } catch (err) {
    next(new HttpError('Signup failed.', 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(new HttpError('Invalid credentials.', 401));

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return next(new HttpError('Invalid credentials.', 401));

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ user: user.toObject({ getters: true }), token });
  } catch (err) {
    next(new HttpError('Login failed.', 500));
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Link',
      message: `<p>Click the link to reset your password: <a href="${resetURL}">${resetURL}</a></p>`
    });

    res.status(200).json({ message: 'Password reset link sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Error generating reset link' });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};
