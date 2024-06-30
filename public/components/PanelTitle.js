import {data} from "./data.js";
import {getConversationName} from "../main.js";

// this is such a weird component i probably should've just not added it.
// biggest problem was importing getConversationName wasn't working in main.html
// so instead of putting it there and using it as a slot i had to put it here instead

export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {
        getConversationName,
        getTitle() {
            if (this.type === 'openConversation') return getConversationName(data.openConversationID)
            return ""
        }
    },
    template: `
      <div class="panelTitle" v-if="showPanel"><slot/>{{getTitle()}}</div>
    `,
    props: {
        type: {
            type: String
        }
    },
    computed: {
        showPanel() {
            console.log(this.type, !(['openConversation', 'chatInfo'].includes(this.type) && data.openConversationID === -1))
            return !(['openConversation', 'chatInfo'].includes(this.type) && data.openConversationID === -1)
        },
    }
}