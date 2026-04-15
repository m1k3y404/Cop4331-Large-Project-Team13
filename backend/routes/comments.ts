import express from 'express';
import type { Request, Response } from 'express';
import { Types, isValidObjectId } from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from './login.js';
import type { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    let username;
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      let payload = jwt.verify(token, jwtSecret) as JwtPayload;
      username = payload['username'] as string;
    } catch {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const creator = username;
    const { postId, content } = req.body as { postId: string; content: string };
    if (!postId || !creator || !content) {
      res.status(400).json({ error: 'postId, creator, and content are required' });
      return;
    }
    if (!isValidObjectId(postId)) {
      res.status(400).json({ error: 'invalid postId' });
      return;
    }
    const postExists = await Post.findById(postId);
    if (!postExists) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    const newComment = await Comment.create({ postId: new Types.ObjectId(postId), creator, content });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/:postId', async (req: Request, res: Response) => {
  try {
    const postId = req.params['postId'] as string;
    if (!isValidObjectId(postId)) {
      res.status(400).json({ error: 'invalid postId' });
      return;
    }
    const comments = await Comment.find({ postId: new Types.ObjectId(postId) }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    let username;
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      let payload = jwt.verify(token, jwtSecret) as JwtPayload;
      username = payload['username'] as string;
    } catch {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const id = req.params['id'] as string;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ error: 'comment not found' });
      return;
    }
    if (comment.creator != username) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({ error: '' });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

export default router;
