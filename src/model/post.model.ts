import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string; // type script data type 'string'
  content: string;
  author: mongoose.Types.ObjectId;
  imageURL?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true }, // mongoDB data type "String"
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageURL: String,
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>('Post', PostSchema);
