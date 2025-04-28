// Theme switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('bi-moon-fill');
            icon.classList.add('bi-sun-fill');
        } else {
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-fill');
        }
    }
});

// Initialize toastr options
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: 3000,
    preventDuplicates: true
};

// Show loader
function showLoader() {
    $('#loader').removeClass('d-none');
}

// Hide loader
function hideLoader() {
    $('#loader').addClass('d-none');
}

// Show toast notification
function showToast(type, message) {
    switch(type) {
        case 'success':
            toastr.success(message);
            break;
        case 'error':
            toastr.error(message);
            break;
        case 'warning':
            toastr.warning(message);
            break;
        case 'info':
            toastr.info(message);
            break;
    }
}

// Document ready handler
$(document).ready(function() {
    // Set up CSRF token for all AJAX requests
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Show loader on page load
    showLoader();

    // Hide loader when page is fully loaded
    $(window).on('load', function() {
        hideLoader();
    });

    // AJAX setup with loader
    $(document).ajaxStart(function() {
        showLoader();
    });

    $(document).ajaxStop(function() {
        hideLoader();
    });

    // Handle AJAX errors
    $(document).ajaxError(function(event, jqXHR, settings, error) {
        hideLoader();
        let errorMessage = 'An error occurred. Please try again.';
        
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            errorMessage = jqXHR.responseJSON.message;
        }
        
        showToast('error', errorMessage);
    });

    // Check for flash messages
    if (typeof flashMessages !== 'undefined') {
        Object.entries(flashMessages).forEach(([type, message]) => {
            showToast(type, message);
        });
    }
}); 