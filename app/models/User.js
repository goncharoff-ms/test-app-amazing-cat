const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({  
  username: {
    type: String,
    required: true,
    unique: true,
    validate: (v) => {
      return new Promise((resolve, reject) => {
        const usernameRegExp = /^[a-z0-9A-Z_]{5,15}$/;
        const msg = v + ' is not a valid username!';

        let result = usernameRegExp.test(v);

        if (result) {
          console.log('USERNAME VALIDATION TRUE' + result);
          resolve(result);
        } else {
          reject(msg);
        }
      });
    }
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.statics.hashPassword = function(password) {
  return new Promise((resolve, reject) => {
    const usernameRegExp = /^.{6,15}$/;
    const msg = password + ' is not a valid password!';
    let result = usernameRegExp.test(password);
    if (result) {
      bcrypt.hash(password, 8, (err, hashedPassword) => {
        resolve(hashedPassword);
      });
    } else {
      reject(msg);
    }
  });
};

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');