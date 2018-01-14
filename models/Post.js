const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  creationDate: Date,
  lastEditDate: Date
});
mongoose.model('Post', PostSchema);

module.exports = mongoose.model('Post');