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
    template: `
        <div class="settingsRow">
          {{e}}
          <input type="color" :value="computedStyle.getPropertyValue(propName)" @input="function(event) {
              root.style.setProperty(propName, event.target.value)
              data.theme.set(propName, event.target.value)
          }">
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