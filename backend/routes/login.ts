import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';


const router = express.Router();

// register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ error: 'Username already in use' });
      return;
    }

    const user = new User({
      username,
      email,
      password,
      isVerified: true,
    });

    await user.save();

    res.status(201).json({ error: '', message: 'Account created! Please check your email to verify.' });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Username or email already in use' });
      return;
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// verify email 
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ error: '', message: 'Email verified! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// login - blocks unverified users
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (user == null) {
      res.status(401).json({ error: 'Incorrect Password' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: 'Please verify your email before logging in' });
      return;
    }

    res.status(200).json({ error: '' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.json({ error: '', message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    await sendPasswordResetEmail(email, token);
    res.json({ error: '', message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// reset password 
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ error: '', message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;