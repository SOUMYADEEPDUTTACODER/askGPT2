document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggle
    const togglePassword = () => {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.querySelector('.eye-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '👁️‍🗨️';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    };

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            // Password confirmation check
            const password = form.querySelector('input[name="password"]');
            const confirmPassword = form.querySelector('input[name="confirm_password"]');
            
            if (confirmPassword && password.value !== confirmPassword.value) {
                isValid = false;
                confirmPassword.classList.add('error');
                alert('Passwords do not match');
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    });

    // Input validation on blur
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
    });
}); 