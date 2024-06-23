export default {

    template: `
      <button class="userBlock itemBlock" :data-userID="user.userID">
          <profile-pic :size=50 :userid="user.userID" :shapes="user.shapes"></profile-pic>
          <div class="onlineUserListButtonText">{{user.username}}</div>
      </button>
    `,
    props: {
        user: {
            type: Object
        }
    }
}
// <user-block :username="user.username"></user-block>
// function addToUserList(user) {
//     $('#currentlyOnlineUsers').append(`<button class="userBlock itemBlock" userID=${user.userID} onclick="startNewConversation(${user.userID})">
//         ${showProfilePic(user.userID, 50)}
//         <div class="onlineUserListButtonText">${user.username}</div>
//     </button>`)
//     $(`.userBlock[userID=${user.userID}]`).contextmenu((e) => showUserContextMenu(e))
//     drawShapes(`${user.userID}`, loadedUsers.get(user.userID).profilePic)
// }