const request = require('supertest');
const app = require('../../server');

describe('Admin Routes Integration Tests', () => {
  describe('Dashboard Route', () => {
    describe('GET /admin/dashboard', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/dashboard');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });

  describe('Class Management Routes', () => {
    describe('GET /admin/classes', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/classes');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /admin/classes/add', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/classes/add');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/classes/create', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/classes/create')
          .send({ name: 'Form 1A', level: 'Form 1' });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /admin/classes/:id', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/classes/1');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });

  describe('Student Management Routes', () => {
    describe('GET /admin/students', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/students');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /admin/students/add', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/students/add');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/students/create', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/students/create')
          .send({
            first_name: 'John',
            last_name: 'Doe',
            class_id: 1,
          });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should validate required fields', async () => {
        const response = await request(app)
          .post('/admin/students/create')
          .send({ first_name: 'John' }); // Missing last_name and class_id

        expect(response.status).toBe(302);
      });
    });
  });

  describe('User Management Routes', () => {
    describe('GET /admin/users', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/users');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /admin/users/add', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/users/add');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/users/create', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/users/create')
          .send({
            full_name: 'Test User',
            email: 'test@example.com',
            role: 'teacher',
          });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });

  describe('Subject Management Routes', () => {
    describe('GET /admin/subjects', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/subjects');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/subjects/create', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/subjects/create')
          .send({
            name: 'Mathematics',
            code: 'MATH101',
          });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });

  describe('Score Review Routes', () => {
    describe('GET /admin/scores', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/scores');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/scores/approve/:id', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).post('/admin/scores/approve/1');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/scores/approve-multiple', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/scores/approve-multiple')
          .send({ score_ids: [1, 2, 3] });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should validate score_ids array', async () => {
        const response = await request(app)
          .post('/admin/scores/approve-multiple')
          .send({ score_ids: 'invalid' });

        expect(response.status).toBe(302);
      });
    });
  });

  describe('Report Routes', () => {
    describe('GET /admin/reports/send', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/admin/reports/send');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('POST /admin/reports/send-bulk', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/admin/reports/send-bulk')
          .send({
            class_id: 1,
            academic_year: '2024',
            term: '1',
          });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });
});
