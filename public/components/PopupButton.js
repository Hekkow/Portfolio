import {data} from "./data.js"
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <button class="popupCloseButton" @click="data.openPopup = data.popups.None"><slot/></button>
    `,
}