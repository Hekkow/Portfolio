import App from '/components/Portfolio/PortfolioApp.js'
import {data} from '/components/Portfolio/PortfolioData.js'
App.mount('#App')
let currentPanel = 0
let scrollBody = $('html, body')
let canScroll = true
let panels
let previousDirection = 1
let animationTime = 1000
let scrollTime = 400
let animating = []
let slideshows
$(document).ready(function() {
    panels = $('.panel')
    data.numberPanels = panels.length
})
// $(document).ready(function() {
//     scrollBody.scrollTop(0)
//     panels = $('.panel')
//     slideshows = $('.slideshow')
//     numberPanels = panels.length
//     for (let i = 0; i < numberPanels; i++) {
//         let button = $('<button class="scrollMenuButton"></button>')
//         button.on('click', function() {
//             scrollTo(i)
//         })
//         $('#scrollMenu').append(button)
//         panels.eq(i).css('z-index', numberPanels-i)
//     }
//     for (let i = 0; i < slideshows.length; i++) {
//         let images = $(slideshows[i]).find('img')
//
//         for (let j = 0; j < images.length; j++) {
//             let image = $(images[j])
//             console.log(image)
//             let rotation = (j-(images.length/2)+0.5)*10
//             console.log(rotation)
//             image.css('transform', `rotate(${rotation}deg)`)
//             image.on('mouseenter', function(event) {
//                 $(event.target).css('transform', 'rotate(0)')
//             })
//             image.on('mouseleave', function(event) {
//                 $(event.target).css('transform', `rotate(${rotation}deg)`)
//             })
//         }
//     }
//     updateScrollMenuButtons()
//     $(document).on('wheel touchmove', function(event) {
//         if (!canScroll) return
//         let animatingPanel = currentPanel
//         let scrollDirection = event.originalEvent.deltaY < 0 ? -1 : 1
//         if (scrollDirection === -1) animatingPanel -= 1
//         if (!doAnimate(animatingPanel)) return
//         let goingToPanel = currentPanel + scrollDirection
//         if (goingToPanel === -1 || goingToPanel === numberPanels) return
//
//
//         let rechargeTime = scrollTime
//
//         animatePanel(animatingPanel, scrollDirection)
//         canScroll = false
//         setTimeout(function() {
//             canScroll = true
//         }, rechargeTime)
//     })
// })
// function doAnimate(panel) {
//     if (animating.includes(panel)) return false
//     animating.push(panel)
//     setTimeout(function() {
//         animating = animating.filter(p => p !== panel)
//     }, animationTime)
//     return true
// }
// let canScrollButton = true
// function scrollTo(n) {
//     if (!canScrollButton) return
//     console.log('hera')
//     canScrollButton = false
//
//     let scrollDirection = 1
//     if (n <= currentPanel) scrollDirection = -1
//     let numberPanels = 0
//     if (scrollDirection === 1) {
//         for (let i = currentPanel; i < n; i++) {
//             setTimeout(function() {
//                 animatePanel(i, scrollDirection)
//             }, (i - currentPanel)*scrollTime)
//             numberPanels++
//         }
//     }
//     else {
//         for (let i = currentPanel - 1; i >= n; i--) {
//             setTimeout(function() {
//                 animatePanel(i, scrollDirection)
//             }, (currentPanel - i - 1)*scrollTime)
//             numberPanels++
//         }
//
//     }
//     setTimeout(function() {
//         canScrollButton = true
//     }, scrollTime * numberPanels + (animationTime - scrollTime))
// }
// function animatePanel(index, scrollDirection) {
//     let panel = panels.eq(index)
//     let animationClass = scrollDirection === 1 ? 'animatingPageUp' : 'animatingPageDown'
//     let classToRemove = scrollDirection === -1 ? 'animatingPageUp' : 'animatingPageDown'
//     panel.addClass(animationClass)
//     panel.removeClass(classToRemove)
//     currentPanel = scrollDirection === 1 ? index + 1 : index
//     updateScrollMenuButtons()
// }
// function updateScrollMenuButtons() {
//     $('.scrollMenuButton').removeClass('selected')
//     $('#scrollMenu').children().eq(currentPanel).addClass('selected')
// }