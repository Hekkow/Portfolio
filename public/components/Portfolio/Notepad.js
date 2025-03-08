import {data} from "./PortfolioData.js";
export default {
    data() {
        return {
            data: data,
        }
    },
    template: `
      <div class="notepad">
        <div contenteditable="true" class="notepad-textarea" spellcheck="false" ref="textarea" v-html="app.text">
        </div>
      </div>
    `,
    mounted() {
        this.app.top = "10%"
        this.app.left = "52%"
        let ta = this.$refs.textarea
        ta.focus()
    },
    props: {
        app: Object,
    },
}