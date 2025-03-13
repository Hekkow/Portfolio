import {data} from "./PortfolioData.js"
import DesktopShortcut from "./DesktopShortcut.js";
import app from "./App.js"
import Desktop from "./Desktop.js";
import Computer from "./Computer.js";
import Taskbar from "./Taskbar.js";
import TaskbarApp from "./TaskbarApp.js";
import TrashBin from "./TrashBin.js";
import StartMenuApp from "./StartMenuApp.js";
import StartMenu from "./StartMenu.js";
import SystemTray from "./SystemTray.js";
import Notepad from "./Notepad.js";
import game from "./game.js";
import Weather from "./Weather.js";
import Chatbox from "./Chatbox.js";
import ImageViewer from "./ImageViewer.js";
import Virus from "./Virus.js";
import PeskyPlant from "./PeskyPlant.js";
import CommandPrompt from "./CommandPrompt.js";
const App = Vue.createApp({
    data() {
        return {
            data
        }
    }
});
App.component('computer', Computer)
App.component('desktop', Desktop)
App.component('desktop-shortcut', DesktopShortcut)
App.component('app', app)
App.component('taskbar', Taskbar)
App.component('taskbar-app', TaskbarApp)
App.component('trash-bin', TrashBin)
App.component('start-menu-app', StartMenuApp)
App.component('start-menu', StartMenu)
App.component('system-tray', SystemTray)
App.component('notepad', Notepad)
App.component('game', game)
App.component('weather', Weather)
App.component('chatbox', Chatbox)
App.component('image-viewer', ImageViewer)
App.component('virus', Virus)
App.component('pesky-plant', PeskyPlant)
App.component('command-prompt', CommandPrompt)
export default App