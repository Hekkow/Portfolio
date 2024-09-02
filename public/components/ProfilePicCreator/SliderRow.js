import {data} from "../data.js";
import {
    setMode,
} from "../../ProfilePictureCreation.js";

export default {
    methods: {
        setMode,
    },
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="sliderRow">
        <button v-if="!$slots.default" @click="setMode(mode, shapeid)">{{ mode }}</button>
        <slot/>
      </div>
    `,
    props: {
        shapeid: {
            type: Number
        },
        mode: {
            type: Object
        }
    },
}