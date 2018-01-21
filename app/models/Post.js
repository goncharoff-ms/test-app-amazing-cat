const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  creationDate: { type: Date, required: false, default: Date.now() },
  lastEditDate: { type: Date, required: false, default: null },
});
mongoose.model('Post', PostSchema);

module.exports = mongoose.model('Post');
