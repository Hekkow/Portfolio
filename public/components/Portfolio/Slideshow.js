import {rotateAway, rotateBack} from "../../index.js";

export default {
    data() {
        return {
            selected: 0,
            animating: [],
            imageTransforms: new Map(),
            start: null,
            overlapTime: null,
            translateY: 0,
            translateX: 0,
            slideshowID: 'slideshow1'
        }
    },
    template: `
      <div class="slideshowContainer" :id="slideshowID">

        <div class="slideshowSide">
          <button @click="previous" class="drawnBorder" v-show="this.selected !== 0"><</button>
        </div>
        <div class="slideshowCenter">
          <div class="slideshowImageContainer">
            <slideshow-image
                v-for="(image, index) in images"

                :ref="slideshowID + 'image' + index"
                :newID="slideshowID + 'image' + index"
                :image="image"
                :text="texts[index]"
                :z="images.length - index"
            />
          </div>
          <div class="slideshowTextDiv">
            <slideshow-text v-for="(text, index) in texts" :text="text" :z="images.length - index" :ref="slideshowID + 'text' + index" :newID="slideshowID + 'text' + index" />
          </div>
        </div>
        <div class="slideshowSide">
          <button @click="next" class="drawnBorder" v-show="this.selected !== this.images.length - 1">></button>
        </div>
      </div>
    `,
    props: {
        images: {
            type: Array,
        },
        texts: {
            type: Array
        }
    },
    methods: {
        previous() {
            if (this.selected === 0) return
            let animatingSlide = this.$refs[this.slideshowID + 'image' + (this.selected - 1)][0]
            let animatingText = this.$refs[this.slideshowID + 'text' + (this.selected - 1)][0]
            if (animatingSlide.animating || animatingText.animating) return

            animatingSlide.animateBack()
            animatingText.animateBack()
            this.selected -= 1
        },
        next() {
            if (this.selected === this.images.length - 1) return
            let animatingSlide = this.$refs[this.slideshowID + 'image' + (this.selected)][0]
            let animatingText = this.$refs[this.slideshowID + 'text' + (this.selected)][0]
            if (animatingSlide.animating || animatingText.animating) return
            animatingSlide.animateAway()
            animatingText.animateAway()
            this.selected += 1
        },
    },
    // mounted() {
    //     setTimeout(() => {
    //         for (let i = 1; i < this.images.length; i++) {
    //             console.log(this.$refs, this.slideshowID + 'image' + i)
    //
    //             this.$refs[this.slideshowID + 'image' + i][0].style.backgroundColor = 'red'
    //             // rotateAway(this.$refs[this.slideshowID + 'image' + i][0])
    //         }
    //     }, 50)
    //
    // }
}