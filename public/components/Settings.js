import {data} from "./data.js";
import {logout, rejoinGeneral, showBlockedUsersPopup, startProfilePicCreator} from "../main.js";
export default {
    methods: {showBlockedUsersPopup, rejoinGeneral, startProfilePicCreator, logout},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div id="settings">
        <div id="settingsLeftPanel">
          <button @click="data.openSettings = data.settingsTabs.User">User</button>
          <button @click="data.openSettings = data.settingsTabs.ProfilePic">Profile Pic</button>
          <button @click="data.openSettings = data.settingsTabs.Chats">Chats</button>
          <button @click="data.openSettings = data.settingsTabs.Blocked">Blocked</button>
          <button @click="data.openSettings = data.settingsTabs.Censored">Censored</button>
        </div>
        <div id="settingsMainPanel" style="background-color: red">
          <div v-if="data.openSettings === data.settingsTabs.User">
            <button>Change username</button>
            <button>Change password</button>
            <button @click="logout()">Logout</button>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.ProfilePic">
            <button @click="startProfilePicCreator()">Create Profile Picture</button>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Chats">
            <button @click="rejoinGeneral()">Rejoin Howdy</button>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Blocked">
            <button @click="showBlockedUsersPopup()">Blocked Users</button>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Censored"></div>
        </div>
      </div>
        
    `,
}