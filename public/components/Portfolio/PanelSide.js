export default {
    template: `
        <div class="panelSide" :style="{width: width, flexGrow: width ? null : 1} ">
          <slot/>
        </div>
    `,
    props: {
        width: {
            type: String,
            default: null
        }
    },
}