import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
            root: null,
            computedStyle: null,
            modalBackground: null,
        }
    },
    methods: {
        setTheme(event) {
            this.root.style.setProperty(this.propName, event.target.value)
            data.theme.set(this.propName, event.target.value)
        }
    },
    template: `
        <div class="settingsRow">
          {{e}}
          <input type="color" :value="computedStyle.getPropertyValue(propName)" @input="setTheme">
        </div>
    `,
    props: {
        e: {
            type: String
        }
    },
    computed: {
        propName() {
            return '--' + this.e.toLowerCase().replace(/ /g, '-')
        }
    },
    beforeMount() {
        this.root = document.querySelector(':root')
        this.modalBackground = document.querySelector('.modalBackground')
        this.computedStyle = getComputedStyle(this.root)
    }
}