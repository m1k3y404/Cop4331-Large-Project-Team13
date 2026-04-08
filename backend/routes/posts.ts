import express from 'express';
import type { Request, Response } from 'express';
import { Types, isValidObjectId } from 'mongoose';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { analyzePostInBackground } from '../utils/tagger.js';

const router = express.Router();

const stopwords = ['the','and','for','that','this','with','from','have','are','was','were','they','you','your','not','but','can','will','just','what','when','been','also','more','into','than','then','some','would','there'];

function extractTags(title: string, content: string) {
  const text = (title + ' ' + content).toLowerCase();
  const words = text.split(/\W+/).filter(w => w.length > 3 && !stopwords.includes(w));
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, creator } = req.body as { title: string; content: string; creator: string };
    if (!title || !content || !creator) {
      res.status(400).json({ error: 'title, content, and creator are required' });
      return;
    }
    const tags = extractTags(title, content);
    const newPost = await Post.create({ title, content, creator, tags });
    analyzePostInBackground(newPost._id.toString(), content);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments()
    ]);
    const postIds = posts.map(p => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    const countMap: Record<string, number> = {};
    for (const row of commentCounts) {
      countMap[String(row._id)] = row.count as number;
    }
    const result = posts.map(p => ({
      ...p.toObject(),
      commentCount: countMap[String(p._id)] ?? 0
    }));
    res.status(200).json({ posts: result, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query['q'] as string;
    if (!q) {
      res.status(400).json({ error: 'missing search query' });
      return;
    }
    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, 'i');
    const posts = await Post.find({
      $or: [{ title: regex }, { content: regex }, { tags: regex }]
    }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/tag/:tag', async (req: Request, res: Response) => {
  try {
    const tag = req.params['tag'] as string;
    const posts = await Post.find({ tags: tag }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/user/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params['username'] as string;
    const posts = await Post.find({ creator: username }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }
    const { title, content, creator } = req.body as { title: string; content: string; creator: string };
    if (!title || !content || !creator) {
      res.status(400).json({ error: 'title, content, and creator are required' });
      return;
    }
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    if (post.creator !== creator) {
      res.status(403).json({ error: 'not authorized' });
      return;
    }
    const tags = extractTags(title, content);
    post.title = title;
    post.content = content;
    post.tags = tags;
    post.updatedAt = new Date();
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    if (!isValidObjectId(id)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }
    const { creator } = req.body as { creator: string };
    if (!creator) {
      res.status(400).json({ error: 'creator is required' });
      return;
    }
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    if (post.creator !== creator) {
      res.status(403).json({ error: 'not authorized' });
      return;
    }
    await post.deleteOne();
    await Comment.deleteMany({ postId: new Types.ObjectId(id) });
    res.status(200).json({ error: '' });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

export default router;
