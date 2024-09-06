import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <button v-if="blocked" class="itemBlock">
          <profile-pic :size=50 :userid="user.userID"></profile-pic>
      </button>
    `,
    props: {
        user: {
            type: Object
        }
    },
    computed: {
        blocked() {
            if (!data.loadedUsers.has(data.userID)) return false
            return !data.loadedUsers.get(data.userID).blocked.includes(this.user.userID)
        }
    }
}