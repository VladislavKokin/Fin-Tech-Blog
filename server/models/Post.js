import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema({
  introduction: { type: String, default: '', maxlength: 100000 },
  body: { type: String, default: '', maxlength: 100000 },
  conclusion: { type: String, default: '', maxlength: 100000 },
}, { _id: false })

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 250 },
  imageUrl: { type: String, default: '', maxlength: 2048 },
  content: { type: contentSchema, required: true },
  publishedAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Optional migration identity, excluded from the API and ordinary queries.
  legacyId: { type: String, unique: true, sparse: true, immutable: true, select: false },
}, { timestamps: true, bufferCommands: false })

postSchema.index({ publishedAt: -1, _id: -1 })

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema)
