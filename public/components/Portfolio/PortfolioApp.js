import {data} from "./PortfolioData.js"
import Slideshow from "./Slideshow.js";
import Panel from "./Panel.js";
import ScrollMenu from "./ScrollMenu.js";
import ScrollButton from "./ScrollButton.js";
import PanelSide from "./PanelSide.js";
import GoToArea from "./GoToArea.js";
import SegmentButton from "./SegmentButton.js";


const App = Vue.createApp({
    data() {
        return {
            data
        }
    }
});
App.component('slideshow', Slideshow)
App.component('panel', Panel)
App.component('scroll-menu', ScrollMenu)
App.component('scroll-button', ScrollButton)
App.component('panel-side', PanelSide)
App.component('go-to-area', GoToArea)
App.component('segment-button', SegmentButton)
export default App