/* global describe it expect */

const expect = require('chai').expect;

describe('Server', () => {
  it('should exist', () => (
    expect(require('./server.js')).to.be.defined  // eslint-disable-line global-require
  ));
  const isValidURL = (require('./server.js')).isValidURL; // eslint-disable-line global-require

  describe('isValidURL', () => {
    it('should take an URL and return true if it\'s a valid URL in http://www.example.com format', () => {
      const input = 'http://www.example.com';
      const actual = isValidURL(input);
      const expected = true;

      expect(actual).to.equal(expected);
    });
    it('should take an URL and return true if it\'s a valid URL in http://www.example.com format like https://example.com', () => {
      const input = 'https://example.com';
      const actual = isValidURL(input);
      const expected = true;

      expect(actual).to.equal(expected);
    });
    it('should take an URL and return true if it\'s a valid URL in http://www.example.com format like www.example.com', () => {
      const input = 'www.example.com';
      const actual = isValidURL(input);
      const expected = true;

      expect(actual).to.equal(expected);
    });
    it('should take an URL and return true if it\'s a valid URL in http://www.example.com format like example.com', () => {
      const input = 'example.com';
      const actual = isValidURL(input);
      const expected = true;

      expect(actual).to.equal(expected);
    });
    it('should take an URL and return false if it\'s not a valid URL in http://www.example.com format like http://www.example', () => {
      const input = 'http://www.example';
      const actual = isValidURL(input);
      const expected = false;

      expect(actual).to.equal(expected);
    });
    it('should take an URL and return false if it\'s not a valid URL in http://www.example.com format like httpx://www.example.com', () => {
      const input = 'httpx://www.example.com';
      const actual = isValidURL(input);
      const expected = false;

      expect(actual).to.equal(expected);
    });
  });
  const generateKey = (require('./server.js')).generateKey; // eslint-disable-line global-require

  describe('generateKey', () => {
    it('should take a valid URL and return a hash key (number in base 36)', () => {
      const input = 'www.exampleasdasdasdasdasdasdasdasdasdasdasd.com';
      const actual = generateKey(input);
      const expected = 's37sb6';

      expect(actual).to.equal(expected);
    });
  });
});
