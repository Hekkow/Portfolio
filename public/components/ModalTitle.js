import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `<div class="modalTitle">
      <slot/>
    </div>
    `,
}