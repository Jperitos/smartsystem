
function setRadioValue(name, value) {
  const radios = document.getElementsByName(name);
  radios.forEach(radio => {
    radio.checked = radio.value === value;
  });
}


function loadUserProfile(user) {
  const form = document.getElementById('profile-form');
  form.elements['user_id'].value = user._id || '';

  form.elements['name'].value = user.name || '';
  form.elements['email'].value = user.email || '';

  if (user.info) {
    setRadioValue('gender', user.info.gender || '');
    form.elements['birthdate'].value = user.info.birthdate ? user.info.birthdate.split('T')[0] : '';
    form.elements['contact'].value = user.info.contact || '';
    form.elements['address'].value = user.info.address || '';
  } else {
    setRadioValue('gender', '');
    form.elements['birthdate'].value = '';
    form.elements['contact'].value = '';
    form.elements['address'].value = '';
  }

 
  const img = document.querySelector('.profile-img');
  if (user.avatar) img.src = user.avatar;
}


document.addEventListener('DOMContentLoaded', () => {
 fetch('/users/me', {
  credentials: 'include'  
})
.then(res => {
  if (!res.ok) throw new Error('Failed to load user data');
  return res.json();
})
.then(user => {
  loadUserProfile(user);
})
.catch(err => {
  console.error(err);
  alert('Error loading profile');
});
});
