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
$('#loginForm').submit(function(e) {
    let username = $('#usernameInput').val()
    let password = $('#passwordInput').val()
    e.preventDefault();

    if (!username || !username.trim() || !password || !password.trim()) {
        alert("Missing something")
        return
    }
    startLoadingAnimation()
    $.post('attemptLogin', $(this).serialize(), (response) => {
        if (response.sessionID) {
            if (response.sessionID === -1) {
                alert("Invalid username or password")
                Cookies.remove(loginCookie)
                return
            }
            Cookies.set(loginCookie, response.sessionID)
            window.location.href = '/main'
        }
    })
});
function startLoadingAnimation() {
    let button = $('#loginButton')
    setInterval(() => {
        button.attr('Value', button.attr('Value') + ".")
    }, 1000)

}