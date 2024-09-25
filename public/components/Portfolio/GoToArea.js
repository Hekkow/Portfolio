export default {
    template: `
        <div class="segment" :style="{width: width}">
            <div class="segmentTitle segmentMargined">
                <slot name="title"/>
            </div>
            <div :class="{segmentText: true, segmentMargined: $slots.button}">
                <slot name="text"/>
            </div>
            <button class="segmentButton" v-if="$slots.button">
                <slot name="button"/>
            </button>
        </div>
        
    `,
    props: {
        width: {}
    }
}