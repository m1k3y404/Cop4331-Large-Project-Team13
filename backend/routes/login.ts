import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
// google auth deps -dechante
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import jwt = require("jsonwebtoken");

const router = express.Router();
// google client -dechante
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const jwtSecret = process.env.JWT_SECRET as string;

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

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      username,
      email,
      password,
      verificationToken,
    });

    await user.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ error: '', message: 'Account created! Please check your email to verify.' });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Username or email already in use' });
      return;
    }
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
  }
});

// verify email -dechante
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || 'https://13.projectucf.software';
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    // reject empty / missing tokens, otherwise findOne could match any null token user -dechante
    if (typeof token !== 'string' || token.length === 0) {
      res.redirect(`${FRONTEND_BASE}/verify-email?status=error`);
      return;
    }
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.redirect(`${FRONTEND_BASE}/verify-email?status=error`);
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect(`${FRONTEND_BASE}/verify-email?status=success`);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
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

    let token = jwt.sign({ username }, jwtSecret, { expiresIn: '72h' });

    res.status(200).json({ error: '', token });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
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
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
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
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
  }
});

router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params['username'] as string;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userRes = {
      username: user.username,
      isVerified: user.isVerified
    }

    res.json(userRes);
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
  }
})

// google auth -dechante
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ error: 'Missing Google credential' });
      return;
    }

    const audience = process.env.GOOGLE_CLIENT_ID;
    if (!audience) {
      res.status(500).json({ error: 'Google auth not configured' });
      return;
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience,
      });
    } catch (verifyErr) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const email = payload.email;
    const googleId = payload.sub;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // retry on username collision -dechante
      const baseUsername = (payload.name ?? email.split('@')[0] ?? 'user').replace(/\s+/g, '').toLowerCase();
      let suffix = 0;
      while (true) {
        const candidate = suffix === 0 ? baseUsername : `${baseUsername}${suffix}`;
        try {
          user = new User({ username: candidate, email, googleId, isVerified: true });
          await user.save();
          break;
        } catch (err: any) {
          if (err.code === 11000 && err.keyPattern?.username) {
            suffix += 1;
            continue;
          }
          // double-click race on email or googleId, look up the now-existing user instead -dechante
          if (err.code === 11000 && (err.keyPattern?.email || err.keyPattern?.googleId)) {
            const existing = await User.findOne({ $or: [{ googleId }, { email }] });
            if (existing) { user = existing; break; }
          }
          throw err;
        }
      }
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    let token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '72h' });

    res.status(200).json({ error: '', token });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
    console.error(err.toString())
  }
});

export default router;