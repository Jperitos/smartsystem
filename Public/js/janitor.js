function showNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('show'); // Toggle a 'show' class to show/hide
}

// To close notification dropdown when clicking outside (optional)
window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const bellIcon = document.querySelector('a[onclick="showNotifications()"]');
    if (!bellIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Profile dropdown
const profileIcon = document.getElementById('profileIcon');
const profileDropdown = document.getElementById('profileDropdown');

profileIcon.addEventListener('click', function(event) {
    event.preventDefault();
    profileDropdown.classList.toggle('show');
});

// Optional: Hide profile dropdown when clicking outside
window.addEventListener('click', function(event) {
    if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('show');
    }
});
