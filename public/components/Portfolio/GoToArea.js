export default {
    template: `
        <div class="segment" :style="{width: width}">
            <div class="segmentTitle">
                <slot name="title"/>
            </div>
            <div class="segmentText">
                <slot name="text"/>
            </div>
            <button class="segmentButton">
                <slot name="button"/>
            </button>
        </div>
        
    `,
    props: {
        width: {}
    }
}