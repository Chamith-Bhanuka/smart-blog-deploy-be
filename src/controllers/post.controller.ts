import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Post } from '../model/post.model';
import cloudinary from '../config/cloudinary.config';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    let imageURL = '';

    if (req.file) {
      imageURL = `/uploads/${req.file.filename}`;
    }

    // req.file?.buffer -> use to get image from request

    const newPost = new Post({
      title,
      content,
      tags: tags.split(','),
      imageURL,
      author: req.user.sub,
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post successfully created',
      data: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post.!' });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'firstName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    return res.status(200).json({
      message: 'Posts data',
      data: posts,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get post.!' });
  }
};

export const getMyPost = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) | 1;
    const limit = parseInt(req.query.limit as string) | 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: req.user.sub });

    res.status(200).json({
      message: 'Posts data',
      data: posts,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch posts.!' });
  }
};

export const savePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    let imageURL = '';

    if (req.file) {
      const result: any = await new Promise((resole, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: 'posts' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resole(result); // success return
          }
        );
        upload_stream.end(req.file?.buffer);
      });
      imageURL = result.secure_url;
    }

    const newPost = new Post({
      title,
      content,
      tags: tags.split(','),
      imageURL,
      author: req.user.sub,
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post successfully created',
      data: newPost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post.!', error: err });
  }
};
