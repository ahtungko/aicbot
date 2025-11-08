const crypto = require('crypto');

const mockUUID = () => crypto.randomBytes(16).toString('hex');

module.exports = {
  v4: mockUUID,
  v1: mockUUID,
  v3: mockUUID,
  v4: mockUUID,
  v5: mockUUID,
};
