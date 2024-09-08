import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div id="userInfoPanel" v-if="data.userID !== -1">
        <profile-pic :size="50" :userid="data.userID" style="margin: var(--profile-pic-margin)"></profile-pic>
        <p>{{username}}</p>
        <button @click="data.openModal = data.modals.Settings" class="closeButton borderedButton squareButton" title="Settings">⚙️</button>
      </div>
    `,
    computed: {
        username() {
            return data.loadedUsers.get(data.userID).username
        }
    },
}
