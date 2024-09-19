import {data} from "./data.js";
import {getConversationName, onMessagesScroll, scrollToBottom} from "../main.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
        <button v-if="data.mobile" class="panelTopButton" @click="data.activePanel = panel">
          <icon :icon="icon"/>
        </button>
    `,
    props: {
        icon: {
            type: String,
        },
        panel: {
            type: String
        }
    }
}