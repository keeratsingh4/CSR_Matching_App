const request = require('supertest');
const app = require('../server.js');

describe('Request routes', () => {
  it('GET /api/requests should return 200', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.statusCode).toBe(200);
  });
});
