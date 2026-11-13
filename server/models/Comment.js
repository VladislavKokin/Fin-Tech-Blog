import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true, bufferCommands: false })

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema)
