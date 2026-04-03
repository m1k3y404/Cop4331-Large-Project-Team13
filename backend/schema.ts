import { Schema, model, connect, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: {type: String, required: true},
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

const User = model<IUser>('User',userSchema);


const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};


export {User, connectDB};
