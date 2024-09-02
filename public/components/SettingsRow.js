import {data} from "./data.js";
export default {
    methods: {},
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="settingsRow">
        <slot/>
      </div>
    `,
}