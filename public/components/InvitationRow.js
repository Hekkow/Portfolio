import {data} from "./data.js";
import {} from "../main.js";
export default {
    methods: {},
    data() {
        return {
            data: data,
        }
    },
    template: `
        <div class="userRow">
          {{invitation.conversationID}}
          Invited by 
          <profile-pic :size="30" :userid="$props.invitation.inviter" class="userRowProfilePic"/>
          <button class="userRowButton">Accept</button>
          <button class="userRowButton">Decline</button>
        </div>
    `,
    props: {
        invitation: {
            type: Object,
        },
    },
}