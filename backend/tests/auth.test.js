const request = require('supertest');
const app = require('../server.js');

describe('Auth routes', () => {
  it('should respond to GET /api/auth/me with 401 when no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
