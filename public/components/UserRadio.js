import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      
      <label style="user-select: none">
        {{user.username}}
        <input type="radio" :value="user.userID" name="groupChatPopup" v-model="data.usersRadio">
      </label>
    `,
    props: {
        user: {
            type: Object
        },
    },
}