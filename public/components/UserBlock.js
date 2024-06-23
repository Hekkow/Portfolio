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