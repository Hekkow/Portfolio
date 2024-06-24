import {startConversation} from "../main.js";

export default {
    methods: {startConversation},
    template: `
      <button class="userBlock itemBlock" :data-userID="user.userID" @click="startConversation(user.userID)">
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