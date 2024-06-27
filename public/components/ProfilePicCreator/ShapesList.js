import {data} from "../data.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <shape-item v-if="data.profilePictureOpen" v-for="shape in shapes()" :shape="shape"></shape-item>
    `,
    methods: {
        shapes() {
            // console.log("THE SHAPES LIST IS", Array.from(data.shapes.values()))
            return Array.from(data.shapes.values())
        }
    }
}