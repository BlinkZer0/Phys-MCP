// Jest setup for CAS tool tests
const { jest } = require('@jest/globals');

// Make Jest globals available
global.jest = jest;
global.describe = describe;
global.test = test;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
