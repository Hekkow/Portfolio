import {data} from "./data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <div class="modalBackground" v-if="data.settingsOpen">
        <div id="mainSettingsPanel">
          <div id="settingsLeftPanel">
            <button onclick="logout()">Logout</button>
            <button onclick="rejoinGeneral()">Rejoin Howdy</button>
            <button onclick="showBlockedUsersPopup()">Blocked Users</button>
            <button onclick="startProfilePicCreator()">Create Profile Picture</button>
            <button>Change username</button>
            <button>Change password</button>
          </div>
          
        </div>
      </div>
    `,
    computed: {
        username() {
            return data.loadedUsers.get(data.userID).username
        }
    },
    watch: {
        'data.profilePictureOpen' (open) {
            if (open) data.settingsOpen = false
        }
    }
}
