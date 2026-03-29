import { Schema, model, connect } from 'mongoose';
interface IUser {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: {type: String, required: true}
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