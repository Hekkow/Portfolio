import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <button @click="data.openModal = data.modals.None"><slot/></button>
    `,
}