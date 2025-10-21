const GradeService = require('../../src/services/gradeService');

describe('GradeService', () => {
  describe('calculateGrade', () => {
    test('should return A+ for score >= 90', () => {
      expect(GradeService.calculateGrade(95)).toBe('A+');
      expect(GradeService.calculateGrade(90)).toBe('A+');
    });

    test('should return A for score >= 80 and < 90', () => {
      expect(GradeService.calculateGrade(85)).toBe('A');
      expect(GradeService.calculateGrade(80)).toBe('A');
    });

    test('should return B for score >= 70 and < 80', () => {
      expect(GradeService.calculateGrade(75)).toBe('B');
      expect(GradeService.calculateGrade(70)).toBe('B');
    });

    test('should return C for score >= 60 and < 70', () => {
      expect(GradeService.calculateGrade(65)).toBe('C');
      expect(GradeService.calculateGrade(60)).toBe('C');
    });

    test('should return D for score >= 50 and < 60', () => {
      expect(GradeService.calculateGrade(55)).toBe('D');
      expect(GradeService.calculateGrade(50)).toBe('D');
    });

    test('should return E for score >= 40 and < 50', () => {
      expect(GradeService.calculateGrade(45)).toBe('E');
      expect(GradeService.calculateGrade(40)).toBe('E');
    });

    test('should return F for score < 40', () => {
      expect(GradeService.calculateGrade(35)).toBe('F');
      expect(GradeService.calculateGrade(0)).toBe('F');
    });
  });

  describe('getGradeRemark', () => {
    test('should return correct remark for each grade', () => {
      expect(GradeService.getGradeRemark('A+')).toBe('Outstanding');
      expect(GradeService.getGradeRemark('A')).toBe('Excellent');
      expect(GradeService.getGradeRemark('B')).toBe('Very Good');
      expect(GradeService.getGradeRemark('C')).toBe('Good');
      expect(GradeService.getGradeRemark('D')).toBe('Fair');
      expect(GradeService.getGradeRemark('E')).toBe('Pass');
      expect(GradeService.getGradeRemark('F')).toBe('Fail');
    });

    test('should return N/A for invalid grade', () => {
      expect(GradeService.getGradeRemark('X')).toBe('N/A');
    });
  });

  describe('validateScore', () => {
    test('should accept valid CA scores (0-40)', () => {
      const result = GradeService.validateScore(30, 50);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid exam scores (0-60)', () => {
      const result = GradeService.validateScore(35, 55);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject CA score > 40', () => {
      const result = GradeService.validateScore(45, 50);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('CA score must be between 0 and 40');
    });

    test('should reject CA score < 0', () => {
      const result = GradeService.validateScore(-5, 50);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('CA score must be between 0 and 40');
    });

    test('should reject exam score > 60', () => {
      const result = GradeService.validateScore(30, 65);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exam score must be between 0 and 60');
    });

    test('should reject exam score < 0', () => {
      const result = GradeService.validateScore(30, -10);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Exam score must be between 0 and 60');
    });

    test('should reject both invalid scores', () => {
      const result = GradeService.validateScore(45, 65);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('calculateClassAverage', () => {
    test('should calculate average correctly', () => {
      const scores = [
        { total_score: 80 },
        { total_score: 70 },
        { total_score: 90 },
      ];
      expect(GradeService.calculateClassAverage(scores)).toBe('80.00');
    });

    test('should return 0 for empty array', () => {
      expect(GradeService.calculateClassAverage([])).toBe(0);
    });

    test('should handle null input', () => {
      expect(GradeService.calculateClassAverage(null)).toBe(0);
    });
  });

  describe('formatPosition', () => {
    test('should format positions correctly', () => {
      expect(GradeService.formatPosition(1)).toBe('1st');
      expect(GradeService.formatPosition(2)).toBe('2nd');
      expect(GradeService.formatPosition(3)).toBe('3rd');
      expect(GradeService.formatPosition(4)).toBe('4th');
      expect(GradeService.formatPosition(11)).toBe('11th');
      expect(GradeService.formatPosition(21)).toBe('21st');
      expect(GradeService.formatPosition(22)).toBe('22nd');
      expect(GradeService.formatPosition(23)).toBe('23rd');
    });
  });

  describe('calculateOverallSummary', () => {
    test('should calculate overall summary correctly', () => {
      const scores = [
        { total_score: 80 },
        { total_score: 70 },
        { total_score: 90 },
      ];
      const summary = GradeService.calculateOverallSummary(scores);

      expect(summary.totalSubjects).toBe(3);
      expect(summary.totalMarks).toBe('240.00');
      expect(summary.averageScore).toBe('80.00');
      expect(summary.grade).toBe('A');
    });

    test('should handle empty scores', () => {
      const summary = GradeService.calculateOverallSummary([]);

      expect(summary.totalSubjects).toBe(0);
      expect(summary.totalMarks).toBe(0);
      expect(summary.averageScore).toBe(0);
      expect(summary.grade).toBe('N/A');
    });
  });
});
