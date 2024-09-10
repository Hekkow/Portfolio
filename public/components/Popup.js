import {data} from "./data.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.openPopup !== data.popups.None" class="modalBackground" @click="function(event) {
          if (event.target.classList.contains('modalBackground')) data.openPopup = data.popups.None
      }">
        <div class="popup">
          <div v-if="data.openPopup === data.popups.Blocked">
            This user has blocked you
          </div>
          <div v-if="data.openPopup === data.popups.LongMessage">
            Your message is too long
          </div>
        </div>
      </div>
    `,
}