const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true },
  author: {type: String, required: true},
  creationDate: {type: Date, required: false, default: Date.now()},
  lastEditDate: {type: Date, required: false, default: null}
});
mongoose.model('Post', PostSchema);

module.exports = mongoose.model('Post');