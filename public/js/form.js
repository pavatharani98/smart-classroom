function autoCalc() {
  const total = parseInt(document.getElementById('total_students').value) || 0;
  const boys  = parseInt(document.getElementById('male_students').value) || 0;
  const girls = parseInt(document.getElementById('female_students').value) || 0;
  const warn  = document.getElementById('student-warning');

  if ((boys + girls) !== total && (boys > 0 || girls > 0) && total > 0) {
    warn.classList.remove('hidden');
  } else {
    warn.classList.add('hidden');
  }
}

// Number inputs: select all on focus
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('focus', () => input.select());
});

// Form loading state
document.getElementById('classroomForm').addEventListener('submit', function(e) {
  const btn = this.querySelector('.btn-submit');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving & Generating QR...';
  btn.disabled = true;
});
