import {data} from "./PortfolioData.js"
import Slideshow from "./Slideshow.js";
import Panel from "./Panel.js";
import PanelSide from "./PanelSide.js";
import GoToArea from "./GoToArea.js";
import SegmentButton from "./SegmentButton.js";
import SlideshowImage from "./SlideshowImage.js";
import SlideshowText from "./SlideshowText.js";
const App = Vue.createApp({
    data() {
        return {
            data
        }
    }
});
App.component('slideshow', Slideshow)
App.component('panel', Panel)
App.component('panel-side', PanelSide)
App.component('go-to-area', GoToArea)
App.component('segment-button', SegmentButton)
App.component('slideshow-image', SlideshowImage)
App.component('slideshow-text', SlideshowText)
export default App