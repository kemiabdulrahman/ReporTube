class GradeService {
  static calculateGrade(totalScore) {
    if (totalScore >= 90) return 'A+';
    if (totalScore >= 80) return 'A';
    if (totalScore >= 70) return 'B';
    if (totalScore >= 60) return 'C';
    if (totalScore >= 50) return 'D';
    if (totalScore >= 40) return 'E';
    return 'F';
  }

  static getGradeRemark(grade) {
    const remarks = {
      'A+': 'Outstanding',
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Fair',
      'E': 'Pass',
      'F': 'Fail',
    };
    return remarks[grade] || 'N/A';
  }

  static calculateClassAverage(scores) {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + parseFloat(score.total_score || 0), 0);
    return (total / scores.length).toFixed(2);
  }

  static getClassPosition(studentTotal, allTotals) {
    const sortedTotals = [...allTotals].sort((a, b) => b - a);
    const position = sortedTotals.indexOf(studentTotal) + 1;
    return this.formatPosition(position);
  }

  static formatPosition(position) {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = position % 100;
    return position + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }

  static calculateStatistics(scores) {
    if (!scores || scores.length === 0) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
      };
    }

    const totals = scores.map(s => parseFloat(s.total_score || 0));
    const passed = scores.filter(s => parseFloat(s.total_score || 0) >= 40).length;

    return {
      total: scores.length,
      average: (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2),
      highest: Math.max(...totals).toFixed(2),
      lowest: Math.min(...totals).toFixed(2),
      passRate: ((passed / scores.length) * 100).toFixed(2),
    };
  }

  static validateScore(caScore, examScore) {
    const errors = [];

    if (caScore < 0 || caScore > 40) {
      errors.push('CA score must be between 0 and 40');
    }

    if (examScore < 0 || examScore > 60) {
      errors.push('Exam score must be between 0 and 60');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getPerformanceComment(totalScore) {
    if (totalScore >= 90) return 'Exceptional performance! Keep up the excellent work.';
    if (totalScore >= 80) return 'Excellent work! Continue to maintain this standard.';
    if (totalScore >= 70) return 'Very good performance. Keep working hard.';
    if (totalScore >= 60) return 'Good effort. There is room for improvement.';
    if (totalScore >= 50) return 'Fair performance. More effort is needed.';
    if (totalScore >= 40) return 'Pass mark achieved. Significant improvement required.';
    return 'Fail. Student needs serious intervention and support.';
  }

  static calculateOverallSummary(studentScores) {
    if (!studentScores || studentScores.length === 0) {
      return {
        totalSubjects: 0,
        totalMarks: 0,
        averageScore: 0,
        grade: 'N/A',
        position: 'N/A',
      };
    }

    const totalMarks = studentScores.reduce(
      (sum, score) => sum + parseFloat(score.total_score || 0),
      0
    );
    const averageScore = totalMarks / studentScores.length;

    return {
      totalSubjects: studentScores.length,
      totalMarks: totalMarks.toFixed(2),
      averageScore: averageScore.toFixed(2),
      grade: this.calculateGrade(averageScore),
      remark: this.getPerformanceComment(averageScore),
    };
  }
}

module.exports = GradeService;
