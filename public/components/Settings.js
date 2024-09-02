import {data} from "./data.js";
import {logout, rejoinGeneral} from "../main.js";
import {setupProfilePicCreator} from "../ProfilePictureCreation.js";
export default {
    methods: {setupProfilePicCreator, rejoinGeneral, logout},
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
        <div id="settingsMainPanel">
          <div v-if="data.openSettings === data.settingsTabs.User" class="settingsTab">
            <settings-row>
              <button>Change username</button>
            </settings-row>
            <settings-row>
              <button>Change password</button>
            </settings-row>
            
            <settings-row>
              <button @click="logout()">Logout</button>
            </settings-row>
            
          </div>
          <div v-if="data.openSettings === data.settingsTabs.ProfilePic" class="settingsTab">
            <profile-picture-creator></profile-picture-creator>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Chats" class="settingsTab">
            <button v-if="!data.loadedUsers.get(data.userID).conversations.includes(3)" @click="rejoinGeneral()">Rejoin Howdy</button>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Blocked" class="settingsTab">
            <p v-if="blockedUsers.length === 0">No users blocked</p>
            <blocked-user v-for="user in blockedUsers" :user="user"></blocked-user>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Censored" class="settingsTab">
            <p v-if="censoredUsers.length === 0">No users censored</p>
            <censored-user v-for="user in censoredUsers" :user="user"></censored-user>
          </div>
        </div>
      </div>
        
    `,
    computed: {
        user() {
            return data.loadedUsers.get(data.userID)
        },
        blockedUsers() {
            return this.user.blocked.map(userID => data.loadedUsers.get(userID))
        },
        censoredUsers() {
            return this.user.censored.map(userID => data.loadedUsers.get(userID))
        }
    }
}