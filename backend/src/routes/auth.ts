import express, { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { id: user._id };
    jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user!._id, name: user!.name, email: user!.email } });
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user._id };
    jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
