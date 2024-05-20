let message = Cookies.get(loginCookie)
if (message) {
    $.post('attemptLoginID', {userID: message}, (response) => {
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
    e.preventDefault();

    console.log(username)
    if (!username || !username.trim()) return

    $.post('attemptLogin', $(this).serialize(), (response) => {
        if (response.userID) {
            if (response.userID === -1) {
                Cookies.remove(loginCookie)
                return
            }
            Cookies.set(loginCookie, response.userID)
            window.location.href = '/main'
        }
    })
});