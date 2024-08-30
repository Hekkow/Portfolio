import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `<div class="modalTitle">
      <slot/>
      <button class="modalCloseButton" @click="data.openModal = data.modals.None; data.openPopup = data.popups.None">x</button>
    </div>
    `,

}