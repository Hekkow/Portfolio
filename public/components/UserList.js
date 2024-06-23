import {store} from "./data.js";

export default {
    data() {
        return {
            store
        }
    },
    template: `
      <div v-for="user in store.currentlyOnlineUsers">
        <button>
          {{user.username}}
        </button>
      </div>
    `,
}