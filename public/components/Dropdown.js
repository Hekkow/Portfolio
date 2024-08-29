import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div class="dropdown">
          <button class="dropdownButton">{{$props.label}}</button>
          <div class="dropdownContent">
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