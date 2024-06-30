import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div v-if="data.openConversationID !== -1 && typingUsers.length > 0">
          {{typingUsers}} are typing
        </div>
    `,
    computed: {
        typingUsers() {
            if (!data.typingConversations.has(data.openConversationID)) return []
            return data.typingConversations.get(data.openConversationID).filter(userID => userID !== data.userID).map(userID => data.loadedUsers.get(userID).username).join(', ')
        }
    }
}