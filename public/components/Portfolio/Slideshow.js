export default {
    data() {return {selected: 0}},
    template: `
      <div class="slideshowContainer">
        <div class="slideshowSide">
          <button @click="previous"><</button>
        </div>
        <div class="slideshowCenter">
        <div class="slideshowImageContainer">
          <img class="slideshowImage" :src="images[selected]" :title="texts[selected]"/>
        </div>
        <div class="slideshowButtons">
            <button v-for="n in images.length" @click="selected = n-1" :class="{scrollMenuButton: true, selected: selected === n - 1}"></button>
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
            this.selected -= 1
            if (this.selected < 0) this.selected = this.images.length - 1
        },
        next() {
            this.selected += 1
            if (this.selected === this.images.length) this.selected = 0
        }
    }
}