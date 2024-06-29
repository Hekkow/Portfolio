import {startConversation} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {startConversation},
    template: `
      <button v-if="blocked" class="itemBlock" @click="startConversation(user.userID)">
          <profile-pic :size=50 :userid="user.userID"></profile-pic>
          <div class="onlineUserListButtonText">{{user.username}}</div>
      </button>
    `,
    props: {
        user: {
            type: Object
        }
    },
    computed: {
        blocked() {
            return !data.loadedUsers.get(data.userID).blocked.includes(this.user.userID)
        }
    }
}