import {data} from "./data.js";
import {getConversationName, scrollToBottom} from "../chat.js";

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
        <mobile-navigation-button icon="Chats" :panel="data.panels.Messages" style="left: 0"/>
        <div style="display: flex; height: 20px;">
          <p style="margin: 0; padding: 0;">Chat settings</p>
          <group-chat-buttons/>
        </div>
        <div v-if="data.mobile" class="panelTopButton"/>
      </div>
      <div class="panelArea" style="border: 0">
        <user-list type="participant-block" v-if="data.openConversationID !== -1"></user-list>
      </div>
    `,
    mounted() {
        data.loadingPage = false
    }
}