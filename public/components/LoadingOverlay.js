import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
<!--      <div v-if="data.userID === -1" class="modalBackground" style="z-index: 1000; background-color: black"></div>-->
      <div v-if="data.userID === -1" class="modalBackground"></div>
    `,
}