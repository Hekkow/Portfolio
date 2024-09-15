import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div class="dropdown">
          <button class="dropdownOpenButton squareButton smallButton" @click.stop="$refs.dropdownContent.classList.toggle('dropdownOpened')"><icon :icon="$props.icon" :fit="true"/></button>
          <div class="dropdownContent" ref="dropdownContent">
            <slot/>
          </div>
        </div>
    `,
    props: {
        icon: {
            type: String
        }
    },
}