import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <input type="checkbox" :value="user.userID" name="groupChatPopup" v-model="data.createGroupChatUsers"><label :for="user.userID">{{user.username}}</label>
      
    `,
    props: {
        user: {
            type: Object
        }
    }
}