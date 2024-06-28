import {data} from "../data.js";
import {sortedShapes} from "../../ProfilePictureCreation.js";

export default {
    data() {
        return {
            data: data
        }
    },
    template: `
      <shape-item v-if="data.profilePictureOpen" v-for="shape in sortedShapes()" :shape="shape"></shape-item>
    `,
    methods: {
        sortedShapes,
    }
}