export default {
    template: `
      <div class="segment drawnBorder" :style="{width: width}">
        <div class="segmentTitle segmentMargined">
          <slot name="title"/>
        </div>
        <div :class="{segmentText: true, segmentMargined: $slots.button}">
          <slot name="text"/>
        </div>
      <slot name="button"/>
      </div>

    `,
    props: {
        width: {},
        link: {},
    }
}