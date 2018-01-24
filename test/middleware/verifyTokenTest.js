/* eslint-disable no-underscore-dangle,prefer-destructuring,no-undef,no-unused-vars,prefer-arrow-callback */
const verifyToken = require('../../app/middleware/verifyToken');

const chai = require('chai');

const fs = require('fs');

const assert = chai.assert;

const redis = require('../../app/connectors/RedisConnector');

const sinon = require('sinon');

const jwt = require('jsonwebtoken');


describe('verifyToken middleware', () => {
  const trueToken = 'trueToken';

  context('correct params', () => {
    it('it should be true response', (done) => {
      const res = {};
      const req = { headers: {} };
      req.headers['x-access-token'] = trueToken;
      const tokenObj = { id: 'testUserId', jti: 'User:TestJti', exp: Date.now() + 24 * 360 }
      const stubJwt = sinon.stub(jwt, 'verify').callsFake((token, secret, cb) => {
        cb(null, tokenObj);
      });
      const stubRedis = sinon.stub(redis, 'exists').callsFake((jti, cb) => {
        cb(null, 0);
      });
      verifyToken(req, res, function next(error) {
        assert.equal(req.userId, 'testUserId');
        assert.equal(req.token.jti, tokenObj.jti);
        assert.equal(error, null);
        done();
      });
    });
  });
});

