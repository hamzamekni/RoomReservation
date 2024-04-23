const speakeasy = require('speakeasy');

function generateSecret() {
    speakeasy.generateSecret();
    return speakeasy.generateSecret().base32;

}

function verifyToken(token) {
    var secret=process.env.SECRET_KEY;
    return  speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
      });
  
    }

module.exports = { generateSecret, verifyToken };
