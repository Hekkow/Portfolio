import {data} from "../data.js";
import {sortedShapes} from "../../ProfilePictureCreation.js";

export default {
    data() {
        return {
            data: data,
            lastSortedShapes: []
        }
    },
    template: `
      <div id="shapesList">
        <shape-item v-for="shape in sortedShapes()" :shape="shape"></shape-item>
      </div>
    `,
    methods: {
        sortedShapes
    },
}