export default {
    template: `
      <div class="segment drawnBorder" :style="{width: width}">
        <div class="segmentTitle segmentMargined">
          <slot name="title"/>
        </div>
        <div :class="{segmentText: true, segmentMargined: $slots.button}">
          <slot name="text"/>
        </div>
        <segment-button v-if="$slots.button">
          <slot name="button"/>
        </segment-button>
        <!--            <button class="segmentButton drawn-border" v-if="$slots.button">-->
        <!--                <slot name="button"/>-->
        <!--            </button>-->
      </div>

    `,
    props: {
        width: {}
    }
}