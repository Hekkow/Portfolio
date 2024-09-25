export default {
    data() {
        return {
            selected: 0,
            animating: [],
            imageTransforms: new Map()
        }
    },
    template: `
      <div class="slideshowContainer">
        <div class="slideshowSide">
          <button @click="previous"><</button>
        </div>
        <div class="slideshowCenter">
        <div class="slideshowImageContainer">
          <img
              class="slideshowImage" 
              v-for="(image, index) in images" 
              :src="'Images/' + image" 
              :style="{transform: selected === index ? null : this.imageTransforms.get(index), zIndex: images.length - index}" 
              :title="texts[index]"
              :ref="'image' + index"
          />
        </div>
        <div class="slideshowText">
            <p>{{texts[selected]}}</p>
        </div>
      </div>
        <div class="slideshowSide">
          <button @click="next">></button>
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
            let animatingSlide = this.selected - 1
            if (this.animating.includes(animatingSlide)) return
            this.selected -= 1
            this.animating.push(animatingSlide)
            this.addThenRemoveClass('animatingSlideBack')
        },
        next() {
            if (this.selected === this.images.length - 1) {
                return
            }
            let animatingSlide = this.selected
            if (this.animating.includes(animatingSlide)) {
                return
            }

            this.addThenRemoveClass('animatingSlideAway')
            this.selected += 1
            this.animating.push(animatingSlide)

        },
        getTransform() {
            let randomX = this.random(-20, 20)
            let randomY = this.random(-20, 10)
            let rotation = this.random(-10, 10)
            return 'translate(' + randomX + 'px, ' + randomY + 'px) rotate(' + rotation + 'deg)'
        },
        addThenRemoveClass(className) {
            let toRemove = ['animatingSlideBack', 'animatingSlideAway'].filter(i => i !== className)[0]
            let originalSelected = this.selected
            let image = $(this.$refs['image' + originalSelected])
            image.addClass(className)
            image.removeClass(toRemove)
            setTimeout(() => {
                this.animating = this.animating.filter(slide => slide !== originalSelected)
            }, 1000)
        },
        random(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }
    },
    beforeMount() {
        for (let i = 0; i < this.images.length; i++) {
            this.imageTransforms.set(i, this.getTransform())
        }
    }
}