import {data} from "./data.js";
import {deleteTheme, saveTheme} from "../chat.js";
export default {
    methods: {deleteTheme, saveTheme},
    data() {
        return {
            data: data,
            root: null,
            main: ['Main color', 'Accent color', 'Background color', 'App background color', 'App text color', 'Scrollbar thumb', 'Link color'],
            messages: ['Message bubble background color', 'Message bubble text color', 'Reply bubble background color', 'Reply bubble text color'],
            messageInput: ['Message bar background color', 'Message bar text color'],
            modals: ['Modal overlay background color', 'Modal background color', 'Modal text color', 'Popup button background color', 'Popup button text color'],
            bigButtons: ['Big button background hover color', 'Big button background active color', 'Big button text hover color', 'Big button text active color'],
            userPopup: ['User popup background color', 'User popup text color'],
            shape: ['Shape background color', 'Shape text color', 'Shape selected color']
        }
    },
    template: `
        <div class="bothSideRow" style="margin-right: 10px; border-bottom: var(--border) var(--main-color)">
            <button class="settingsButton spreadRowButton" @click="saveTheme()"><icon icon="Save" :space="true"/>Save</button>
            <button class="settingsButton spreadRowButton" @click="deleteTheme()"><icon icon="Delete" :space="true"/>Delete</button>
        </div>
        <div class="scrollable">
          <theme-editor-row v-for="str in main" :e="str"/>
          <p>Messages</p>
          <theme-editor-row v-for="str in messages" :e="str"/>
          <p>Message Input</p>
          <theme-editor-row v-for="str in messageInput" :e="str"/>
          <p>Modals</p>
          <theme-editor-row v-for="str in modals" :e="str"/>
          <p>Big buttons</p>
          <theme-editor-row v-for="str in bigButtons" :e="str"/>
          <p>User popups</p>
          <theme-editor-row v-for="str in userPopup" :e="str"/>
          <p>Profile picture shapes</p>
          <theme-editor-row v-for="str in shape" :e="str"/>
        </div>
        

    `,
    mounted() {
        this.root = document.querySelector(':root')
    },

}