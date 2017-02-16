const expect = require('chai').expect;

describe('server', () => {
    it('should exist', () => {
        expect(require('./server.js')).to.be.defined;
    });
});