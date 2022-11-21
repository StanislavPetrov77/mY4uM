function init () {
    document.getElementById('profile-submit-button').addEventListener('click', sendProfileForm)
    const profileShowPasswordButton = document.getElementById('profile-show-password-button')
    profileShowPasswordButton.addEventListener('click', showPassword)
}

function sendProfileForm(e) {
    e.preventDefault()

    document.getElementById('profile-form').submit()
}

function showPassword(e) {
    document.getElementById('profile-password').setAttribute('type', 'text')
}

document.addEventListener('DOMContentLoaded', init)