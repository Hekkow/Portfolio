import {data} from "./data.js"
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div v-if="data.openPopup !== data.popups.None" class="modalBackground" @click="function(event) {
          if (event.target.classList.contains('modalBackground')) {
              data.openPopup = data.popups.None
          }
      }">
          <div class="popup" v-if="data.openPopup === data.popups.Blocked">
            <p class="popupText">This user has blocked you</p>
            <popup-button>Oh no! Anyways</popup-button>
          </div>
          <div class="popup" v-if="data.openPopup === data.popups.LongMessage">
            <p class="popupText">Your message is too long</p>
            <popup-button>Oh no! Anyways</popup-button>
          </div>
        <div class="popup" v-if="data.openPopup === data.popups.NotEnoughPoints">
          <p class="popupText">You can't have less than {{data.minPoints}} points</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.TooManyPoints">
          <p class="popupText">You can't have more than {{ data.maxPoints }} points</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.TooManyShapes">
          <p class="popupText">You can't have more than {{data.maxShapes}} shapes</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.UsernameTaken">
          <p class="popupText">That username is already taken</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.MissingUsername">
          <p class="popupText">You're missing a username</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.MissingPassword">
          <p class="popupText">You're missing a password</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.UsernameChanged">
          <p class="popupText">Username successfully changed</p>
          <popup-button>Yay</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.PasswordChanged">
          <p class="popupText">Password successfully changed</p>
          <popup-button>Yay</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.ImagePasted">
          <p class="popupText">Please send a link to that image instead, I can't afford storage</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.InvalidLoginInfo">
          <p class="popupText">Wrong username or password</p>
          <popup-button>Oh no! Anyways</popup-button>
        </div>
        <div class="popup" v-if="data.openPopup === data.popups.UnsavedProgress">
          <p class="popupText">Your progress might not be saved. Are you sure you want to continue?</p>
          <div>
            <button @click="data.openPopup = data.popups.None; data.openModal = data.modals.None">Close</button>
            <button @click="data.openPopup = data.popups.None">Go back</button>
          </div>
        </div>
      </div>
    `,
}