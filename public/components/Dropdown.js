import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div class="dropdown">
          <button class="dropdownOpenButton squareButton" @click.stop="$refs.dropdownContent.classList.toggle('dropdownOpened')">{{$props.label}}</button>
          <div class="dropdownContent" ref="dropdownContent">
            <slot/>
          </div>
        </div>
    `,
    props: {
        label: {
            type: String
        }
    },
}