import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <message v-if="data.openConversationID !== -1" v-for="message in data.loadedConversations.get(data.openConversationID).texts" :message="message"></message>
    `
}