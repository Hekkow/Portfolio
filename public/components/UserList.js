import {store} from "./data.js";

export default {
    data() {
        return {
            store
        }
    },
    template: `
      <div v-for="user in store.currentlyOnlineUsers">
        <user-block :user="user"></user-block>
      </div>
    `,
}

