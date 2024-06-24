import {deleteMessage} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {
        deleteMessage
    },
    template: `
      <div class="hoverButtons">
        <button v-if="data.userID === message.userID" @click="deleteMessage(message.messageID)">Delete</button>
        <button v-if="data.userID === message.userID">Edit</button>
        <button>Reply</button>
      </div>
    `,
    props: {
        message: {
            type: Object
        }
    }

}