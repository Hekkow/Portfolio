import {data} from "./data.js";
import {} from "../main.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    methods: {
    },
    template: `
      <div v-if="data.openPopup !== data.popups.None" class="modalBackground" @click="function(event) {
          if (event.target.classList.contains('modalBackground')) data.openPopup = data.popups.None
      }">
        <div class="modal">
          <div v-if="data.openPopup === data.popups.Blocked">
            This user has blocked you
          </div>
          <div v-if="data.openPopup === data.popups.LongMessage">
            Your message is too long
          </div>
        </div>
      </div>
    `,
    // make actual user-radio later
    watch: {
        'data.openPopup': function() {

        }
    }
}