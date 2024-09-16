import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="userRow ">
        <profile-pic :size="30" :userid="user.userID" class="userRowProfilePic"/>{{user.username}}
        <input type="checkbox" :value="user.userID" name="groupChatPopup" v-model="data.usersCheckbox" class="userRowButton">
      </div>
    `,
    props: {
        user: {
            type: Object
        },
    },
}