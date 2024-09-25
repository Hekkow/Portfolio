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
    scrollBody.scrollTop(0)
    panels = $('.panel')
    slideshows = $('.slideshow')
    data.numberPanels = panels.length
    for (let i = 0; i < data.numberPanels; i++) {
        panels.eq(i).css('z-index', data.numberPanels-i)
    }
    for (let i = 0; i < slideshows.length; i++) {
        let images = $(slideshows[i]).find('img')

        for (let j = 0; j < images.length; j++) {
            let image = $(images[j])
            console.log(image)
            let rotation = (j-(images.length/2)+0.5)*10
            console.log(rotation)
            image.css('transform', `rotate(${rotation}deg)`)
            image.on('mouseenter', function(event) {
                $(event.target).css('transform', 'rotate(0)')
            })
            image.on('mouseleave', function(event) {
                $(event.target).css('transform', `rotate(${rotation}deg)`)
            })
        }
    }
    updateScrollMenuButtons()
    $(document).on('wheel touchmove', function(event) {
        if (!canScroll) return
        let animatingPanel = currentPanel
        let scrollDirection = event.originalEvent.deltaY < 0 ? -1 : 1
        if (scrollDirection === -1) animatingPanel -= 1
        if (!doAnimate(animatingPanel)) return
        let goingToPanel = currentPanel + scrollDirection
        if (goingToPanel === -1 || goingToPanel === data.numberPanels) return


        let rechargeTime = scrollTime

        animatePanel(animatingPanel, scrollDirection)
        canScroll = false
        setTimeout(function() {
            canScroll = true
        }, rechargeTime)
    })
    scrollToPanel(data.activePanel)
})
function doAnimate(panel) {
    if (animating.includes(panel)) return false
    animating.push(panel)
    setTimeout(function() {
        animating = animating.filter(p => p !== panel)
    }, animationTime)
    return true
}
let canScrollButton = true
export function scrollToPanel(n) {
    if (!canScrollButton) return
    canScrollButton = false

    let scrollDirection = 1
    if (n <= currentPanel) scrollDirection = -1
    let numberPanelsScrolling = 0
    if (scrollDirection === 1) {
        for (let i = currentPanel; i < n; i++) {
            setTimeout(function() {
                animatePanel(i, scrollDirection)
            }, (i - currentPanel)*scrollTime)
            numberPanelsScrolling++
        }
    }
    else {
        for (let i = currentPanel - 1; i >= n; i--) {
            setTimeout(function() {
                animatePanel(i, scrollDirection)
            }, (currentPanel - i - 1)*scrollTime)
            numberPanelsScrolling++
        }

    }
    setTimeout(function() {
        canScrollButton = true
    }, scrollTime * numberPanelsScrolling + (animationTime - scrollTime))
}
function animatePanel(index, scrollDirection) {
    let panel = panels.eq(index)
    let animationClass = scrollDirection === 1 ? 'animatingPageUp' : 'animatingPageDown'
    let classToRemove = scrollDirection === -1 ? 'animatingPageUp' : 'animatingPageDown'
    panel.addClass(animationClass)
    panel.removeClass(classToRemove)
    currentPanel = scrollDirection === 1 ? index + 1 : index
    updateScrollMenuButtons()
}
function updateScrollMenuButtons() {
    $('.scrollMenuButton').removeClass('selected')
    $('#scrollMenu').children().eq(currentPanel).addClass('selected')
}
export function openLink(link) {
    window.open(link, '_blank')
}