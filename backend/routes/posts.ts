import express from 'express';
import type { Request, Response } from 'express';
import { Types, isValidObjectId } from 'mongoose';
import { Post, type IPost } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { analyzePostInBackground } from '../utils/sentiment_analizer.js';
import { parseScoreFilters, postMatchesScoreFilters } from '../utils/postScoreFilters.js';
import jwt from 'jsonwebtoken';
import { jwtSecret } from './login.js';
import type { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

const stopwords = ['the','and','for','that','this','with','from','have','are','was','were','they','you','your','not','but','can','will','just','what','when','been','also','more','into','than','then','some','would','there'];


function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function attachCommentCounts<T extends { _id: unknown; toObject(): Record<string, unknown> } & IPost>(posts: T[]) {
  const postIds = posts.map(p => p._id);
  const commentCounts = await Comment.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } }
  ]);
  const countMap: Record<string, number> = {};
  for (const row of commentCounts) {
    countMap[String(row._id)] = row.count as number;
  }

  return posts.map(p => ({
    ...p.toObject(),
    scores: p.scores,
    commentCount: countMap[String(p._id)] ?? 0
  }));
}

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
    const { title, content } = req.body as { title: string; content: string; };
    if (!title || !content || !creator) {
      res.status(400).json({ error: 'title, content, and creator are required' });
      return;
    }
    const newPost = await Post.create({ title, content, creator, scores: {}, isAnalyzed: false });
    analyzePostInBackground(newPost._id.toString(), title + '/n' + content);
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
    const result = await attachCommentCounts(posts);
    res.status(200).json({ posts: result, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

router.get('/filter-by-scores', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
    const filters = parseScoreFilters(req.query['scoreFilters']);

    const allPosts = await Post.find().sort({ createdAt: -1 });
    const filteredPosts = allPosts.filter(post => postMatchesScoreFilters(post.scores, filters));
    const total = filteredPosts.length;
    const skip = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    const result = await attachCommentCounts(paginatedPosts);

    res.status(200).json({ posts: result, total, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('scoreFilters')) {
      res.status(400).json({ error: err.message });
      return;
    }

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
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {
      $or: [{ title: regex }, { content: regex }, { creator: regex }]
    };
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter)
    ]);
    const result = await attachCommentCounts(posts);
    res.status(200).json({ posts: result, total, page, limit });
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
    const { title, content } = req.body as { title: string; content: string };
    if (!title || !content) {
      res.status(400).json({ error: 'title, content are required' });
      return;
    }
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    if (post.creator !== username) {
      res.status(403).json({ error: 'not authorized' });
      return;
    }
    post.title = title;
    post.content = content;
    post.updatedAt = new Date();
    await post.save();
    res.status(200).json(post);
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

    let post = await Post.findById(id);
    if(!post) {
      res.status(404).json({ error: 'post not found' });
      return;
    }
    if(post.creator != username) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ postId: new Types.ObjectId(id) });
    res.status(200).json({ error: '' });
  } catch (err) {
    res.status(500).json({ error: 'something went wrong' });
  }
});

export default router;
