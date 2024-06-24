import {deleteMessage, startEdit} from "../main.js";
import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {
        deleteMessage,
        startEdit
    },
    template: `
      <div class="hoverButtons">
        <button v-if="data.userID === message.userID" @click="deleteMessage(message.messageID)">Delete</button>
        <button v-if="data.userID === message.userID" @click="startEdit(message.messageID)">Edit</button>
        <button>Reply</button>
      </div>
    `,
    props: {
        message: {
            type: Object
        }
    }

}