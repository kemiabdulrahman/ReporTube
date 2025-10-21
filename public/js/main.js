// ReporTube Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Confirm delete actions
  const deleteButtons = document.querySelectorAll('.btn-delete, [data-confirm]');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  // Score validation
  const caScoreInputs = document.querySelectorAll('input[name*="ca_score"]');
  caScoreInputs.forEach(input => {
    input.addEventListener('blur', function() {
      const value = parseFloat(this.value);
      if (value < 0 || value > 40) {
        this.classList.add('is-invalid');
        showTooltip(this, 'CA score must be between 0 and 40');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  });

  const examScoreInputs = document.querySelectorAll('input[name*="exam_score"]');
  examScoreInputs.forEach(input => {
    input.addEventListener('blur', function() {
      const value = parseFloat(this.value);
      if (value < 0 || value > 60) {
        this.classList.add('is-invalid');
        showTooltip(this, 'Exam score must be between 0 and 60');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  });

  // Calculate total score automatically
  const scoreRows = document.querySelectorAll('.score-row');
  scoreRows.forEach(row => {
    const caInput = row.querySelector('input[name*="ca_score"]');
    const examInput = row.querySelector('input[name*="exam_score"]');
    const totalDisplay = row.querySelector('.total-score');
    const gradeDisplay = row.querySelector('.grade-display');

    if (caInput && examInput && totalDisplay) {
      const calculateTotal = () => {
        const ca = parseFloat(caInput.value) || 0;
        const exam = parseFloat(examInput.value) || 0;
        const total = ca + exam;

        totalDisplay.textContent = total.toFixed(1);

        if (gradeDisplay) {
          const grade = calculateGrade(total);
          gradeDisplay.textContent = grade;
          gradeDisplay.className = 'grade-display grade-' + grade.toLowerCase().replace('+', '-plus');
        }
      };

      caInput.addEventListener('input', calculateTotal);
      examInput.addEventListener('input', calculateTotal);
    }
  });

  // Batch approve scores
  const approveAllBtn = document.getElementById('approve-all-btn');
  if (approveAllBtn) {
    approveAllBtn.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('.score-checkbox:checked');
      const scoreIds = Array.from(checkboxes).map(cb => cb.value);

      if (scoreIds.length === 0) {
        alert('Please select at least one score to approve');
        return;
      }

      if (confirm(`Approve ${scoreIds.length} score(s)?`)) {
        fetch('/admin/scores/approve-multiple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score_ids: scoreIds }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            location.reload();
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to approve scores');
        });
      }
    });
  }

  // Select all checkboxes
  const selectAllCheckbox = document.getElementById('select-all-scores');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.score-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = this.checked;
      });
    });
  }

  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
});

// Helper Functions
function calculateGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

function showTooltip(element, message) {
  const tooltip = new bootstrap.Tooltip(element, {
    title: message,
    trigger: 'manual',
  });
  tooltip.show();
  setTimeout(() => tooltip.hide(), 3000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Export for use in other scripts
window.ReporTube = {
  calculateGrade,
  showTooltip,
  formatDate,
  formatDateTime,
};
