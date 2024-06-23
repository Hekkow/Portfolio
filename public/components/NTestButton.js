import {store} from "./data.js";

export default {
    data() {
        return {
            store
        }
    },
    template: `
        <button 
            :class="{
                'roundedButton': true,
                'blueButton': type === 'blue',
                'redButton': type === 'red',
            }"
            @click="store.increment()"
            >
            {{ store.count }}
            <slot/>
        </button>
    `,
    props: {
        type: {
            type: String,
            default: 'red'
        }
    }
}