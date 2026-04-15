import { Schema, model, connect, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string | null;
  googleId: string | null;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: {type: String, default: null},
  // dedup in /google route -dechante
  googleId: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

const User = model<IUser>('User',userSchema);

export { User };
export type { IUser };