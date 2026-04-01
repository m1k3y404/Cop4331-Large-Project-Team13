import { Schema, model, Types } from 'mongoose';

interface IComment {
  postId: Types.ObjectId;
  creator: string;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  creator: { type: String, required: true, trim: true, minlength: 1 },
  content: { type: String, required: true, trim: true, minlength: 1 },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ postId: 1, createdAt: 1 });

const Comment = model<IComment>('Comment', commentSchema);

export { Comment };
export type { IComment };
