const EmailService = require('../../src/services/emailService');

describe('EmailService', () => {
  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(EmailService.validateEmail('test@example.com')).toBe(true);
      expect(EmailService.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(EmailService.validateEmail('first+last@company.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(EmailService.validateEmail('invalid')).toBe(false);
      expect(EmailService.validateEmail('test@')).toBe(false);
      expect(EmailService.validateEmail('@domain.com')).toBe(false);
      expect(EmailService.validateEmail('test @example.com')).toBe(false);
      expect(EmailService.validateEmail('')).toBe(false);
      expect(EmailService.validateEmail(null)).toBe(false);
    });
  });

  describe('formatEmailSubject', () => {
    test('should format report email subject correctly', () => {
      const subject = EmailService.formatEmailSubject({
        student_name: 'John Doe',
        academic_year: '2024',
        term: '1',
        type: 'report',
      });

      expect(subject).toContain('John Doe');
      expect(subject).toContain('2024');
      expect(subject).toContain('Term 1');
    });

    test('should format notification email subject', () => {
      const subject = EmailService.formatEmailSubject({
        type: 'notification',
        title: 'Score Approval',
      });

      expect(subject).toContain('Score Approval');
    });
  });

  describe('formatEmailBody', () => {
    test('should format report email body with student details', () => {
      const body = EmailService.formatEmailBody({
        type: 'report',
        student_name: 'John Doe',
        class_name: 'Form 1A',
        academic_year: '2024',
        term: '1',
      });

      expect(body).toContain('John Doe');
      expect(body).toContain('Form 1A');
      expect(body).toContain('2024');
    });

    test('should handle missing optional fields gracefully', () => {
      const body = EmailService.formatEmailBody({
        type: 'report',
        student_name: 'John Doe',
      });

      expect(body).toContain('John Doe');
      expect(body).toBeDefined();
    });
  });

  describe('sanitizeEmailContent', () => {
    test('should remove potentially harmful content', () => {
      const dangerous = '<script>alert("XSS")</script>';
      const sanitized = EmailService.sanitizeEmailContent(dangerous);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    test('should preserve safe HTML tags', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const sanitized = EmailService.sanitizeEmailContent(safe);

      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
    });

    test('should handle null or undefined input', () => {
      expect(EmailService.sanitizeEmailContent(null)).toBe('');
      expect(EmailService.sanitizeEmailContent(undefined)).toBe('');
      expect(EmailService.sanitizeEmailContent('')).toBe('');
    });
  });

  describe('prepareReportEmail', () => {
    test('should prepare complete email object', () => {
      const emailData = {
        to: 'parent@example.com',
        student_name: 'John Doe',
        academic_year: '2024',
        term: '1',
        report_url: 'http://example.com/report.pdf',
      };

      const email = EmailService.prepareReportEmail(emailData);

      expect(email.to).toBe('parent@example.com');
      expect(email.subject).toBeDefined();
      expect(email.html).toBeDefined();
      expect(email.html).toContain('John Doe');
    });

    test('should throw error for invalid email', () => {
      const emailData = {
        to: 'invalid-email',
        student_name: 'John Doe',
      };

      expect(() => EmailService.prepareReportEmail(emailData)).toThrow();
    });
  });

  describe('validateEmailQueue', () => {
    test('should validate email queue with valid data', () => {
      const queue = [
        { to: 'test1@example.com', subject: 'Test 1', body: 'Content 1' },
        { to: 'test2@example.com', subject: 'Test 2', body: 'Content 2' },
      ];

      const result = EmailService.validateEmailQueue(queue);
      expect(result.isValid).toBe(true);
      expect(result.validEmails).toHaveLength(2);
      expect(result.invalidEmails).toHaveLength(0);
    });

    test('should filter out invalid emails', () => {
      const queue = [
        { to: 'valid@example.com', subject: 'Test 1', body: 'Content 1' },
        { to: 'invalid-email', subject: 'Test 2', body: 'Content 2' },
        { to: '', subject: 'Test 3', body: 'Content 3' },
      ];

      const result = EmailService.validateEmailQueue(queue);
      expect(result.isValid).toBe(false);
      expect(result.validEmails).toHaveLength(1);
      expect(result.invalidEmails).toHaveLength(2);
    });

    test('should handle empty queue', () => {
      const result = EmailService.validateEmailQueue([]);
      expect(result.isValid).toBe(true);
      expect(result.validEmails).toHaveLength(0);
    });
  });
});
