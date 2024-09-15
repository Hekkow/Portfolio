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
        <button class="controlButton" @click="setMode(mode, shapeid)"><icon :icon="mode"/> {{ mode }}</button>
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