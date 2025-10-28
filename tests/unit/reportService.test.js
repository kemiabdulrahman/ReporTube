const ReportService = require('../../src/services/reportService');

describe('ReportService', () => {
  describe('generateStudentReport', () => {
    test('should generate report with valid student data', () => {
      const studentData = {
        student: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          class_name: 'Form 1A',
        },
        scores: [
          { subject_name: 'Math', ca_score: 35, exam_score: 55, total_score: 90, grade: 'A+' },
          { subject_name: 'English', ca_score: 30, exam_score: 50, total_score: 80, grade: 'A' },
        ],
        academic_year: '2024',
        term: '1',
      };

      const report = ReportService.generateStudentReport(studentData);

      expect(report).toBeDefined();
      expect(report.student.full_name).toBe('John Doe');
      expect(report.scores).toHaveLength(2);
      expect(report.average_score).toBeGreaterThan(0);
    });

    test('should handle student with no scores', () => {
      const studentData = {
        student: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          class_name: 'Form 1A',
        },
        scores: [],
        academic_year: '2024',
        term: '1',
      };

      const report = ReportService.generateStudentReport(studentData);

      expect(report).toBeDefined();
      expect(report.scores).toHaveLength(0);
      expect(report.average_score).toBe(0);
    });
  });

  describe('formatReportData', () => {
    test('should format report data correctly', () => {
      const rawData = {
        ca_score: '35',
        exam_score: '55',
        total_score: '90',
      };

      const formatted = ReportService.formatReportData(rawData);

      expect(formatted.ca_score).toBe(35);
      expect(formatted.exam_score).toBe(55);
      expect(formatted.total_score).toBe(90);
    });

    test('should handle null values', () => {
      const rawData = {
        ca_score: null,
        exam_score: null,
        total_score: null,
      };

      const formatted = ReportService.formatReportData(rawData);

      expect(formatted.ca_score).toBe(0);
      expect(formatted.exam_score).toBe(0);
      expect(formatted.total_score).toBe(0);
    });
  });

  describe('calculateReportSummary', () => {
    test('should calculate summary statistics', () => {
      const scores = [
        { total_score: 90, grade: 'A+' },
        { total_score: 80, grade: 'A' },
        { total_score: 70, grade: 'B' },
      ];

      const summary = ReportService.calculateReportSummary(scores);

      expect(summary.total_subjects).toBe(3);
      expect(summary.average_score).toBeCloseTo(80, 1);
      expect(summary.highest_score).toBe(90);
      expect(summary.lowest_score).toBe(70);
    });

    test('should handle empty scores array', () => {
      const summary = ReportService.calculateReportSummary([]);

      expect(summary.total_subjects).toBe(0);
      expect(summary.average_score).toBe(0);
      expect(summary.highest_score).toBe(0);
      expect(summary.lowest_score).toBe(0);
    });
  });

  describe('validateReportPeriod', () => {
    test('should validate correct academic year and term', () => {
      const result = ReportService.validateReportPeriod('2024', '1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid term', () => {
      const result = ReportService.validateReportPeriod('2024', '4');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Term must be between 1 and 3');
    });

    test('should reject invalid academic year format', () => {
      const result = ReportService.validateReportPeriod('invalid', '1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid academic year format');
    });
  });
});
