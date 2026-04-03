import express from 'express';
import cors from 'cors';
import { connectDB } from './schema.js';
import loginRoute from './routes/login.js';
import postsRoute from './routes/posts.js';
import commentsRoute from './routes/comments.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', loginRoute);
app.use('/api/posts', postsRoute);
app.use('/api/comments', commentsRoute);

connectDB().then(() => {
  app.listen(3000);
});
