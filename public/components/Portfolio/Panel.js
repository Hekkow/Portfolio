export default {
    template: `
        
        <div class="panel" style="z-index">
            <slot/>
        </div>
    `,
    mounted() {
        this.$nextTick(() => {
            let siblings = this.$el.parentNode.children
            this.$el.style.zIndex = siblings.length - Array.from(siblings).findIndex(child => child === this.$el)
        })
    }
}