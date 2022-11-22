function init () {
    document.getElementById('profile-submit-button').addEventListener('click', sendProfileForm)

    // document.getElementById('clear-message').addEventListener('click', () => { message = null })


    const profilePassword = document.getElementById('profile-password')
    const eye = document.getElementById('eye')
    eye.addEventListener("click", () => {
        eye.classList.toggle("fa-eye-slash")
        const type = profilePassword.getAttribute("type") === "password" ? "text" : "password"
        profilePassword.setAttribute("type", type)
    })

    const profilePicture = document.getElementById('profile-picture')
    const profileFile = document.getElementById('profile-file')
    // profileFile.style.opacity = 0.2
    profileFile.style.display = 'none'
    profileFile.addEventListener('change', () => {
        if (profileFile.files.length === 1) profilePicture.src = URL.createObjectURL(profileFile.files[0])
    })

}

function sendProfileForm(e) {
    e.preventDefault()
    document.getElementById('profile-form').submit()
}


document.addEventListener('DOMContentLoaded', init)