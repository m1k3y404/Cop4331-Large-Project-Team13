import { Schema, model } from 'mongoose';

interface IPost {
  title: string;
  content: string;
  creator: string;
  sentimentScores: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true, trim: true, minlength: 1 },
  content: { type: String, required: true, trim: true, minlength: 1 },
  creator: { type: String, required: true, trim: true, minlength: 1 },
  sentimentScores: { type: [{
    label: { type: String, required: true },
    score: { type: Number, required: true }
  }], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

postSchema.index({ createdAt: -1 });
postSchema.index({ creator: 1 });
postSchema.index({ tags: 1 });

const Post = model<IPost>('Post', postSchema);

export { Post };
export type { IPost };
