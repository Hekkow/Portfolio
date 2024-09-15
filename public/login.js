let sessionID = Cookies.get(loginCookie)
if (sessionID) {
    $.post('attemptLoginID', {sessionID: sessionID}, (response) => {
        if (response.userID) {
            if (response.userID === -1) {
                Cookies.remove(loginCookie)
                return
            }
            window.location.href = '/main'
        }
    })
}
let loadingAnimation
$('#loginForm').submit(function(e) {
    let username = $('#usernameInput').val()
    let password = $('#passwordInput').val()
    e.preventDefault()

    if (!username || !username.trim()) {
        alert("Missing username")
        return
    }
    else if (!password || !password.trim()) {
        alert("Missing password")
        return
    }
    startLoadingAnimation()
    $.post('attemptLogin', $(this).serialize(), (response) => {
        clearInterval(loadingAnimation)
        $('#loginButton').text('Login')
        if (!response.sessionID) return
        if (response.sessionID === -1) {
            alert("Invalid username or password")
            Cookies.remove(loginCookie)

            return
        }
        Cookies.set(loginCookie, response.sessionID)
        window.location.href = '/main'

    })
});
function startLoadingAnimation() {
    let button = $('#loginButton')
    loadingAnimation = setInterval(() => {
        button.attr('Value', button.attr('Value') + ".")
    }, 1000)
}