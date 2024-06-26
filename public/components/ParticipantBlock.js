export default {
    template: `
      <button class="itemBlock">
          <profile-pic :size=50 :userid="user.userID"></profile-pic>
          <div class="onlineUserListButtonText">{{user.username}}</div>
      </button>
    `,
    props: {
        user: {
            type: Object
        }
    }
}