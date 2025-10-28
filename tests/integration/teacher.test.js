const request = require('supertest');
const app = require('../../server');

describe('Teacher Routes Integration Tests', () => {
  describe('Score Entry Routes', () => {
    describe('GET /teacher/scores/my-classes', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/scores/my-classes');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /teacher/scores/entry', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/scores/entry');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should require class_id parameter', async () => {
        const response = await request(app)
          .get('/teacher/scores/entry')
          .query({ subject_id: '1', academic_year: '2024', term: '1' });

        expect(response.status).toBe(302);
      });
    });

    describe('POST /teacher/scores/save', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app)
          .post('/teacher/scores/save')
          .send({
            class_id: 1,
            subject_id: 1,
            scores: [],
          });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should reject invalid score data', async () => {
        const response = await request(app)
          .post('/teacher/scores/save')
          .send({
            class_id: 1,
            scores: [
              { student_id: 1, ca_score: 50, exam_score: 70 }, // Invalid scores
            ],
          });

        expect(response.status).toBe(302);
      });
    });
  });

  describe('Class Management Routes', () => {
    describe('GET /teacher/classes', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/classes');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });

    describe('GET /teacher/classes/:id/students', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/classes/1/students');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should handle invalid class ID', async () => {
        const response = await request(app).get('/teacher/classes/invalid/students');
        expect(response.status).toBe(302);
      });
    });
  });

  describe('Report Routes', () => {
    describe('GET /teacher/reports/student', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/reports/student');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });

      test('should require student_id parameter', async () => {
        const response = await request(app)
          .get('/teacher/reports/student')
          .query({ academic_year: '2024', term: '1' });

        expect(response.status).toBe(302);
      });
    });

    describe('GET /teacher/reports/download', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/reports/download');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });

  describe('Dashboard Route', () => {
    describe('GET /teacher/dashboard', () => {
      test('should redirect to login when not authenticated', async () => {
        const response = await request(app).get('/teacher/dashboard');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
      });
    });
  });
});
