const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: (v, cb) => {
      const usernameRegExp = /^[a-z0-9A-Z_]{5,15}$/;
      const msg = `${v} is not a valid username!`;
      const result = usernameRegExp.test(v);
      cb(result, msg);
    },
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.statics.hashPassword = password => new Promise((resolve, reject) => {
  const usernameRegExp = /^.{6,15}$/;
  const msg = `${password} is not a valid password!`;
  const result = usernameRegExp.test(password);
  if (result) {
    bcrypt.hash(password, 8, (err, hashedPassword) => resolve(hashedPassword));
  } else {
    return reject(msg);
  }
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
