import {data} from "./data.js";
import {getConversationName, scrollToBottom} from "../main.js";

export default {
    data() {
        return {
            data: data
        }
    },
    methods: {
        getConversationName,
    },
    template: `
      <div class="panelTitle">
        <p>{{data.openConversationID !== -1 ? getConversationName(data.openConversationID) : ""}}</p>
        <group-chat-buttons style="margin-left: 3px;"/>
      </div>
      <div class="panelArea" style="border: 0">
        <user-list type="participant-block" v-if="data.openConversationID !== -1"></user-list>
      </div>
    `,
}