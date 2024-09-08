import {data} from "./data.js";
import {deleteTheme, saveTheme} from "../main.js";
export default {
    methods: {deleteTheme, saveTheme},
    data() {
        return {
            data: data,
            root: null,
        }
    },
    template: `
        <theme-editor-row :e="'Main color'"/>
        <theme-editor-row :e="'Accent color'"/>
        <button @click="saveTheme()">Save</button>
        <button @click="deleteTheme()">Delete (refresh to see)</button>
    `,
    mounted() {
        this.root = document.querySelector(':root')
    }
}