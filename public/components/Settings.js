import {data} from "./data.js";
import {changePassword, changeUsername, logout, rejoinGeneral} from "../main.js";
import {setupProfilePicCreator} from "../ProfilePictureCreation.js";
export default {
    methods: {changePassword, changeUsername, setupProfilePicCreator, rejoinGeneral, logout},
    data() {
        return {
            data: data,
            username: '',
            password: ''
        }
    },
    template: `
      <div id="settings">
        <div id="settingsLeftPanel">
          <button class="settingsTabButton" v-for="tab in Object.values(data.settingsTabs)" @click="data.openSettings = tab" :class="{selectedSettingsTab: data.openSettings === tab}">{{ tab }}
          </button>

        </div>
        <div id="settingsMainPanel">
          <div v-if="data.openSettings === data.settingsTabs.User" class="settingsTab">
            <settings-row class="bothSideRow">
              <label style="margin-right: 10px">Change username</label>
              <div>
                <input v-model="username">
                <button class="settingsButton" @click="changeUsername(username)" style="margin-left: 10px">Change</button>
              </div>
            </settings-row>
            <settings-row class="bothSideRow">
              <label style="margin-right: 10px">Change password</label>
              <div><input type="password" v-model="password">
                <button class="settingsButton" @click="changePassword(password)" style="margin-left: 10px">Change</button>
              </div>
            </settings-row>

            <settings-row>
              <button class="settingsButton" @click="logout()" style="margin-left: auto">Logout</button>
            </settings-row>

          </div>
          <div v-if="data.openSettings === data.settingsTabs.ProfilePic" class="settingsTab">
            <profile-picture-creator></profile-picture-creator>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Theme" class="settingsTab" style="padding-right: 0">
            <theme-editor></theme-editor>
          </div>
          <div v-if="data.openSettings === data.settingsTabs.Chats" class="settingsTab">
            <button class="settingsButton biggerButton" v-if="!data.loadedUsers.get(data.userID).conversations.includes(3)"
                    @click="rejoinGeneral()">Rejoin Howdy
            </button>
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
        },
    }
}