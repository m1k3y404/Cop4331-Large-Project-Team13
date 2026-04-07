import express from 'express';
import cors from 'cors';
import { connect} from 'mongoose';
import loginRoute from './routes/login.js';
import postsRoute from './routes/posts.js';
import commentsRoute from './routes/comments.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', loginRoute);
app.use('/api/posts', postsRoute);
app.use('/api/comments', commentsRoute);


const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB().then(() => {
  app.listen(3000);
});
