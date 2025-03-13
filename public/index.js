import App from '/components/Portfolio/PortfolioApp.js'
import {data} from '/components/Portfolio/PortfolioData.js'
let {toRaw} = Vue;
let draggingLocation
let dragging = null
App.directive('draggable', {
    mounted(el, binding, vnode) {
        el.addEventListener("mousedown", (event) => {
            makeActiveApp(binding.instance.app)
            if (!($(event.target).is(".draggable"))) return
            dragging = el
            let bounds = getBounds(el)
            draggingLocation = {x: event.clientX - bounds.x, y: event.clientY - bounds.y}
        })
    }
})
document.addEventListener("mousemove", (event) => {
    if (dragging) {
        let bounds = getBounds($("#desktop")[0])
        $(dragging).css({"left": event.clientX - bounds.x - draggingLocation.x + "px", "top": event.clientY - bounds.y - draggingLocation.y + "px"})
    }
})
document.addEventListener("mouseup", () => {
    dragging = null;
    draggingLocation = null
})
App.mount('#App')
export class AppClass {
    constructor(name, tagName, icon, x, y) {
        this.name = name
        this.minimized = false
        this.tagName = tagName
        this.icon = icon
        this.x = x
        this.y = y
    }
}
let trashBin = new AppClass("Trash", "trash-bin", "trash", 0, 0)
let aboutThisSite = new AppClass("About This Site", "notepad", "notepad", 0, 1)
let weather = new AppClass("Weather", "weather", "weather", 0, 2)
let aboutMe = new AppClass("About Me", "notepad", "notepad", 0, 3)


let myProjects = new AppClass("My Projects", "notepad", "notepad", 1, 0)
let peskyPlant = new AppClass("Pesky Plant", "pesky-plant", "unavailable", 1, 1)
let downloadMoreRAM = new AppClass("Download more RAM", "virus", "ram", 1, 2)
let platformer = new AppClass("Platformer", "game", "unavailable", 1, 3)

// education
// skills
// github, resume

let imageViewer = new AppClass("Image Viewer", "image-viewer", "image-viewer", 2, 0)
let leaveAComment = new AppClass("Leave a Comment", "chatbox", "chatbox", 2, 1)

aboutThisSite.text = `<span class="notepad-red">Hello</span>, and thank you for visiting my portfolio website!
I built it using Vue.js, with a sprinkle of jQuery, Node.js, and GDScript. \
It's based off retro operating systems, and video games that have operating systems within them, which I always love.

To the left are all the apps. They also show up in the start menu at the bottom left (which is supposed to say <span class="notepad-blue">OG</span>, for \
<span class="notepad-blue">Omid Ghafori</span>), and in the taskbar at the bottom.

The source code for this website is stored on <a class="notepad-button" contenteditable="false" href="https://github.com/Hekkow/Portfolio" target="_blank">GitHub</a>

<span class="notepad-green">Technical breakdown</span>
Each app consists of two Vue components. 

One is App.js, which gives each app a border that allows it to be minimized, closed, and dragged.

Each of borders has another, variable component within it. For example, one of them might have a Weather.js component within it. That component is the contents of the app itself. \
The Weather.js component, once it is loaded, calls its mounted function, which makes a request to the Open Meteo API, and updates its contents based off that.

Each app border and app component also has an AppClass, which stores the basic details of that app. These AppClasses are stored in arrays that are used by \
the desktop in order to show the shortcuts, the taskbar to show the open apps, and the start menu to show all the available apps. 

Most of the apps are simple HTML/JS, but a couple are built in Godot and imported using iframes. Overall the code was very quick and easy, it's the art that was difficult.

Thanks to:
- My sister for the pond and background art
- Open Meteo for the weather data
- Godot for the game engine
`

aboutMe.text = `Hello, my name is <span class="notepad-blue">Omid Ghafori</span>. I'm a recent graduate from Carleton University, with a Bachelor of Computer Science Honours, \
specializing in the software engineering stream. If you'd like to contact me, please email \
<a class="notepad-button" contenteditable="false" href="mailto:theomidghafori@gmail.com">theomidghafori@gmail.com</a>

I've <span class="notepad-red">loved</span> coding since I was a kid, and would often build my friends websites as gifts. Now I'm usually building some video game I'll \
most likely never complete.

Aside from coding, I love video games, especially <span class="notepad-red">The Finals</span>. Some other games I like are Hollow Knight and Stardew Valley. I also like \
working out and reading.

I think that AI, while it can be useful in many fields, such as medicine, usually just sucks the humanity out of things. I do not want to see AI generated art, I want to see art \
a human put their <span class="notepad-green">soul</span> into. And I do not think AI will take my job any time soon, it's not very good (yet at least (hopefully forever)).
`

myProjects.text = `<span class="notepad-green">Themid</span>
A project I finished recently is a <a class="notepad-button" contenteditable="false" href="https://theomidghafori.tech/chat" target="_blank">chat app</a>. \
It's a bit ugly but I'm a programmer, not a designer. I used Vue.js for the front-end, along with Node.js with Express WebSockets for the back-end and \
MongoDB for the database.

<img class="notepad-img" src="Images/desktop1.png" onclick="openImage('Images/desktop1.png')">

It has the standard chatting features, such as direct messages, group chats, but I also added many more unique features, such as a <span class="notepad-red">profile picture \
creator</span> and <span class="notepad-red">theme editor</span>. \
The profile picture creator was because I am broke and cannot afford cloud storage, so instead of having profile pictures take up what little storage I had, I created something \
that allowed people to make custom profile pictures themselves that take up way less storage. I also added a censor profile picture option, which I think every single social \
media needs.

<img class="notepad-img" src="Images/profilepic.png" onclick="openImage('Images/profilepic.png')">

<a class="notepad-button" contenteditable="false" href="https://github.com/Hekkow/Portfolio" target="_blank">GitHub</a>

<span class="notepad-green">FPS Game</span>
I worked on this game for about 8 months but lost access to the project sadly, so all I have left is the out of date GitHub page and a couple videos I sent to friends.

While it was alive though, I completed fast paced movement including dashes and grappling hooks, a dynamic weapons system that could combine multiple upgrades like \
explosive bullets and anti gravity, and basic enemy AI with vision and pathfinding.

<video class="notepad-img" controls>
  <source src="Images/fps2.mp4" type="video/mp4">
</video>
<div class="notepad-button" onclick="openImage('Images/fps2.mp4')">Expand</div>

<video class="notepad-img" controls>
  <source src="Images/fps1.mp4" type="video/mp4">
</video>
<div class="notepad-button" onclick="openImage('Images/fps1.mp4')">Expand</div>
<a class="notepad-button" contenteditable="false" href="https://github.com/Hekkow/FPS-Game" target="_blank">GitHub</a>

I lost access to most of my projects recently unfortunately, so these are only projects I've done within the last year or so. Hopefully many more to come.

`

// whoAmI.text = "test1\ntest"

openApp(aboutThisSite)

data.allApps = new Set([trashBin, aboutMe, weather, aboutThisSite, leaveAComment, downloadMoreRAM, myProjects, peskyPlant, platformer, imageViewer])
for (let app of data.allApps) {
    data.desktopApps.set(data.latestDesktopID, app)
    data.latestDesktopID++
}


export function openApp(app) {
    if (data.openApps.has(app)) {
        app.minimized = false
    }
    data.openApps.add(app)
    data.appOrder.unshift(app)
}

function openImage(url) {
    data.openImage = url
    openApp(imageViewer)
}
window.openImage = openImage

export function closeApp(app) {
    data.openApps.delete(app)
    data.appOrder = data.appOrder.filter(a => a !== app)
}

export function minimizeApp(app) {
    app.minimized = true
}

export function makeActiveApp(app) {
    if (data.appOrder[0] === app) return
    let index = data.appOrder.indexOf(app)
    data.appOrder.splice(index, 1)
    data.appOrder.unshift(app)
}
export function toggleMinimizeApp(app) {
    if (data.appOrder[0] !== app) {
        app.minimized = false
        makeActiveApp(app)
        return
    }
    app.minimized = !app.minimized
    if (!app.minimized) {
        makeActiveApp(app)
    }
    else {
        data.appOrder.push(data.appOrder.splice(0, 1))
    }
}
export function getBounds(div) {
    let bounds = div.getBoundingClientRect()
    return {x: bounds.x, y: bounds.y}
}
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});
$("#computer").contextmenu((e) => {
    e.preventDefault()
})
let check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
data.phone = check