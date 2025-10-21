const request = require('supertest');
const app = require('../../server');

describe('Authentication Integration Tests', () => {
  describe('GET /auth/login', () => {
    test('should display login page', async () => {
      const response = await request(app).get('/auth/login');
      expect(response.status).toBe(200);
      expect(response.text).toContain('ReporTube');
      expect(response.text).toContain('Login');
    });
  });

  describe('POST /auth/login', () => {
    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Invalid email or password');
    });

    test('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'somepassword',
        });

      expect(response.status).toBe(302); // Redirect back
    });

    test('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(302); // Redirect back
    });
  });

  describe('GET /auth/logout', () => {
    test('should logout and redirect to login', async () => {
      const response = await request(app).get('/auth/logout');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });
  });

  describe('Protected Routes', () => {
    test('should redirect to login when accessing admin dashboard without auth', async () => {
      const response = await request(app).get('/admin/dashboard');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });

    test('should redirect to login when accessing teacher dashboard without auth', async () => {
      const response = await request(app).get('/teacher/dashboard');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/auth/login');
    });
  });
});

describe('Home Route', () => {
  test('should redirect to login when not authenticated', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/auth/login');
  });
});
