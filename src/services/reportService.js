const PDFDocument = require('pdfkit');
const GradeService = require('./gradeService');

class ReportService {
  async generateStudentReport(studentInfo, scores, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        this.addHeader(doc, options);

        // Student Information
        this.addStudentInfo(doc, studentInfo, options);

        // Scores Table
        this.addScoresTable(doc, scores);

        // Summary and Remarks
        this.addSummary(doc, scores);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(doc, options) {
    const { academic_year, term } = options;

    // School name/logo section
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(process.env.APP_NAME || 'REPORTUBE', { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text('Academic Performance Report', { align: 'center' })
      .moveDown();

    // Academic info
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Academic Year: ${academic_year || 'N/A'}     Term: ${term || 'N/A'}`, {
        align: 'center',
      })
      .moveDown(2);

    // Underline
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();
  }

  addStudentInfo(doc, studentInfo, options) {
    const { class_name, level } = options;

    doc.fontSize(12).font('Helvetica-Bold').text('STUDENT INFORMATION', { underline: true });

    doc.moveDown(0.5);

    const infoY = doc.y;
    const leftColumn = 80;
    const rightColumn = 320;

    // Left column
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Name:', 50, infoY)
      .font('Helvetica')
      .text(
        `${studentInfo.first_name} ${studentInfo.middle_name || ''} ${studentInfo.last_name}`,
        leftColumn,
        infoY
      );

    doc
      .font('Helvetica-Bold')
      .text('Admission No:', 50, infoY + 15)
      .font('Helvetica')
      .text(studentInfo.admission_number, leftColumn, infoY + 15);

    // Right column
    doc
      .font('Helvetica-Bold')
      .text('Class:', rightColumn - 50, infoY)
      .font('Helvetica')
      .text(class_name || 'N/A', rightColumn, infoY);

    doc
      .font('Helvetica-Bold')
      .text('Gender:', rightColumn - 50, infoY + 15)
      .font('Helvetica')
      .text(studentInfo.gender || 'N/A', rightColumn, infoY + 15);

    doc.moveDown(2.5);
  }

  addScoresTable(doc, scores) {
    doc.fontSize(12).font('Helvetica-Bold').text('ACADEMIC PERFORMANCE', { underline: true });

    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const colPositions = {
      subject: 50,
      ca: 260,
      exam: 330,
      total: 400,
      grade: 470,
      remark: 520,
    };

    const rowHeight = 25;

    // Header background
    doc
      .rect(50, tableTop, 495, rowHeight)
      .fill('#4a5568')
      .stroke();

    // Header text
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SUBJECT', colPositions.subject + 5, tableTop + 8)
      .text('CA (40)', colPositions.ca + 5, tableTop + 8, { width: 60, align: 'center' })
      .text('EXAM (60)', colPositions.exam + 5, tableTop + 8, { width: 60, align: 'center' })
      .text('TOTAL', colPositions.total + 5, tableTop + 8, { width: 60, align: 'center' })
      .text('GRADE', colPositions.grade + 5, tableTop + 8, { width: 40, align: 'center' })
      .text('REMARK', colPositions.remark + 5, tableTop + 8, { width: 60 });

    doc.fillColor('#000000');

    // Table rows
    let currentY = tableTop + rowHeight;
    scores.forEach((score, index) => {
      const bgColor = index % 2 === 0 ? '#f7fafc' : '#ffffff';

      doc.rect(50, currentY, 495, rowHeight).fill(bgColor).stroke();

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#000000')
        .text(score.subject_name, colPositions.subject + 5, currentY + 8, { width: 200 })
        .text(
          parseFloat(score.ca_score || 0).toFixed(1),
          colPositions.ca + 5,
          currentY + 8,
          { width: 60, align: 'center' }
        )
        .text(
          parseFloat(score.exam_score || 0).toFixed(1),
          colPositions.exam + 5,
          currentY + 8,
          { width: 60, align: 'center' }
        )
        .text(
          parseFloat(score.total_score || 0).toFixed(1),
          colPositions.total + 5,
          currentY + 8,
          { width: 60, align: 'center' }
        )
        .font('Helvetica-Bold')
        .text(score.grade || 'N/A', colPositions.grade + 5, currentY + 8, {
          width: 40,
          align: 'center',
        })
        .font('Helvetica')
        .text(
          GradeService.getGradeRemark(score.grade),
          colPositions.remark + 5,
          currentY + 8,
          { width: 60, align: 'left' }
        );

      currentY += rowHeight;
    });

    doc.moveDown(2);
  }

  addSummary(doc, scores) {
    const summary = GradeService.calculateOverallSummary(scores);

    doc.moveDown();

    // Summary box
    const summaryY = doc.y;

    doc.rect(50, summaryY, 495, 100).fillAndStroke('#f7fafc', '#4a5568');

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PERFORMANCE SUMMARY', 60, summaryY + 10);

    doc.fontSize(10).font('Helvetica');

    const leftX = 60;
    const rightX = 320;
    const lineY = summaryY + 35;

    doc
      .font('Helvetica-Bold')
      .text('Total Subjects:', leftX, lineY)
      .font('Helvetica')
      .text(summary.totalSubjects, leftX + 100, lineY);

    doc
      .font('Helvetica-Bold')
      .text('Average Score:', leftX, lineY + 20)
      .font('Helvetica')
      .text(`${summary.averageScore}%`, leftX + 100, lineY + 20);

    doc
      .font('Helvetica-Bold')
      .text('Overall Grade:', rightX, lineY)
      .font('Helvetica')
      .text(summary.grade, rightX + 100, lineY);

    doc
      .font('Helvetica-Bold')
      .text('Remark:', rightX, lineY + 20)
      .font('Helvetica')
      .text(GradeService.getGradeRemark(summary.grade), rightX + 100, lineY + 20);

    doc.moveDown(6);

    // Teacher's comment section
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text("Class Teacher's Comment:", 50)
      .moveDown(0.5);

    doc.fontSize(9).font('Helvetica-Oblique').text(summary.remark, 50, doc.y, {
      width: 495,
      align: 'justify',
    });

    doc.moveDown(2);

    // Signature section
    const signY = doc.y;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('_____________________', 80, signY)
      .text("Class Teacher's Signature", 70, signY + 15)
      .text('_____________________', 340, signY)
      .text("Principal's Signature", 350, signY + 15);
  }

  addFooter(doc) {
    const bottomY = 750;

    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .fillColor('#666666')
      .text(
        `Generated by ${process.env.APP_NAME || 'ReporTube'} on ${new Date().toLocaleDateString()}`,
        50,
        bottomY,
        { align: 'center', width: 495 }
      );

    // Grading key
    doc
      .fontSize(7)
      .font('Helvetica')
      .text('Grading Key: A+ (90-100) | A (80-89) | B (70-79) | C (60-69) | D (50-59) | E (40-49) | F (0-39)', 50, bottomY + 15, {
        align: 'center',
        width: 495,
      });
  }

  async generateClassReport(classInfo, studentsData, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 30,
        });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(`${classInfo.name} - Class Report`, { align: 'center' })
          .fontSize(10)
          .font('Helvetica')
          .text(`${options.academic_year || ''} - ${options.term || ''}`, {
            align: 'center',
          })
          .moveDown(2);

        // Class statistics
        // Add detailed class report content here

        doc.end();
        resolve(buffers);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
