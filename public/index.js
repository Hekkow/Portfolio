import App from '/components/Portfolio/PortfolioApp.js'
import {data} from '/components/Portfolio/PortfolioData.js'
App.mount('#App')
let scrollBody = $('html, body')
let canScroll = true
let panels
let animating = []

$(document).ready(function() {
    scrollBody.scrollTop(0)
    panels = $('.panel')
    data.numberPanels = panels.length
    for (let i = 0; i < data.numberPanels; i++) {
        panels.eq(i).css('z-index', data.numberPanels-i)
    }
    $(document).on('wheel touchmove', function(event) {
        if (!canScroll) return
        let animatingPanel = data.currentPanel
        let scrollDirection = event.originalEvent.deltaY < 0 ? -1 : 1
        if (scrollDirection === -1) animatingPanel -= 1
        if (animatingPanel === panels.length - 1 || (animatingPanel === -1 && scrollDirection === -1)) return
        if (animating.includes(animatingPanel)) return
        animatePanel(animatingPanel, scrollDirection)

    })
})
function animatePanel(index, scrollDirection) {
    let panel = panels.eq(index)
    animating.push(index)
    if (scrollDirection === 1) {
        animateObjectAway(panel.get(0), panel.find('.theHAND').get(0), panel.find('.theHANDContainer').get(0), randomDirection()).then(_ => {
            animating = animating.filter(i => i !== index)
        })
    }
    else {
        animateObjectBack(panel.get(0), panel.find('.theHAND').get(0), panel.find('.theHANDContainer').get(0), animationData.get(panel.get(0).id).direction.map(d => d * -1)).then(_ => {
            animating = animating.filter(i => i !== index)

        })
    }
}
window.animatePanel = animatePanel
function randomDirection() {
    let direction = [0, 0]
    direction[random(0, 1)] = [-1, 1][random(0, 1)]
    return direction
}
export function openLink(link) {
    window.open(link, '_blank')
}
let animationData = new Map()
let speedTowards = 0.5
let speedAway = 3
let distance = 3000
let overlapTimeImage = 300
let overlapTimeText = 100
let pauseTime = 200
export function animateObjectAway(removingObject, hand, handContainer, direction) {
    return new Promise((resolve) => {
        handContainer.style.display = 'block'
        let rotation = Math.atan2(direction[1], direction[0]) + Math.PI
        hand.style.transform = `rotate(${rotation}rad)`
        let originalBounds = removingObject.getBoundingClientRect()
        animationData.set(removingObject.id, {originalLeft: originalBounds.left, originalTop: originalBounds.top, direction: direction})
        let $removingObject = $(removingObject)
        let $handContainer = $(handContainer)
        let newHandTop = random($removingObject.offset().top - $handContainer.outerHeight()/2, $removingObject.offset().top + $removingObject.outerHeight() - $handContainer.outerHeight()/2)
        let newHandLeft = random($removingObject.offset().left - $handContainer.outerWidth()/2, $removingObject.offset().left + $removingObject.outerWidth() - $handContainer.outerWidth()/2)
        handContainer.style.top = newHandTop + 'px'
        handContainer.style.left = newHandLeft + 'px'
        if (direction[0] === 1) handContainer.style.left = -$handContainer.outerWidth() + 'px'
        else if (direction[0] === -1) handContainer.style.left = '100vw'
        else if (direction[1] === 1) handContainer.style.top = -$handContainer.outerHeight() + 'px'
        else handContainer.style.top = '100vh'
        let overlapStartTime = null
        let stopped = false
        let initialAnimation = anime({
            targets: handContainer,
            translateX: '+=' + (direction[0] * distance) + 'px',
            translateY: '+=' + (direction[1] * distance) + 'px',
            rotation: rotation,
            easing: 'linear',
            duration: distance/speedTowards,
            update: (anim) => {
                if (overlapping(removingObject, handContainer)) {
                    if (!overlapStartTime) {
                        overlapStartTime = Date.now()
                        return
                    }
                    let overlapTime = overlapTimeImage
                    if (removingObject.id.includes('text')) overlapTime = overlapTimeText
                    if (Date.now() - overlapStartTime < overlapTime) return
                    if (stopped) return
                    stopped = true
                    if (removingObject.id.includes('panel')) data.currentPanel += 1
                    initialAnimation.pause()
                    direction = direction.map(d => d * -1)
                    let animationBack = anime({
                        targets: [removingObject, handContainer],
                        translateX: '+=' + (direction[0] * distance) + 'px',
                        translateY: '+=' + (direction[1] * distance) + 'px',
                        easing: 'linear',
                        duration: distance/speedAway,
                        delay: pauseTime,
                        update: (anim) => {
                            if (!overlapping(removingObject, document.body)) {
                                animationBack.pause()
                                handContainer.style.display = 'none'
                                resolve(direction)
                            }
                        },
                        complete: (anim) => {
                            handContainer.style.display = 'none'
                            resolve(direction)
                        }
                    })
                }
            },
            complete: (anim) => {
                handContainer.style.display = 'none'
                resolve(direction)
            }
        })
    })
}
export function animateObjectBack(removingObject, hand, handContainer, direction) {
    return new Promise((resolve) => {
        handContainer.style.display = 'block'
        direction = direction.map(d => d * -1)
        let initialAnimation = anime({
            targets: [handContainer, removingObject],
            translateX: '+=' + (direction[0] * distance) + 'px',
            translateY: '+=' + (direction[1] * distance) + 'px',
            easing: 'linear',
            duration: distance / speedAway,
            update: (anim) => {
                let bounds = removingObject.getBoundingClientRect()
                let maxDistance = 10 * speedAway
                let imageAnimationData = animationData.get(removingObject.id)
                if (Math.abs(bounds.left - imageAnimationData.originalLeft) < maxDistance && Math.abs(bounds.top - imageAnimationData.originalTop) < maxDistance) {

                    if (removingObject.id.includes('panel')) data.currentPanel -= 1
                    initialAnimation.pause()
                    direction = direction.map(d => d * -1)
                    let imageAnimationBack = anime({
                        targets: [handContainer],
                        translateX: '+=' + (direction[0] * distance) + 'px',
                        translateY: '+=' + (direction[1] * distance) + 'px',
                        easing: 'linear',
                        duration: distance / speedAway,
                        delay: pauseTime,
                        update: (anim) => {
                            if (!overlapping(handContainer, document.body)) {
                                imageAnimationBack.pause()
                                handContainer.style.display = 'none'
                                resolve(true)
                            }
                        },
                        complete: (anim) => {
                            handContainer.style.display = 'none'
                            resolve(true)
                        }
                    })
                }
            },
            complete: (anim) => {
                handContainer.style.display = 'none'
                resolve(true)
            }
        })
    })
}
export function rotateAway(obj) {
    let imageAnimationBack = anime({
        targets: obj,
        rotate: random(-10, 10),
        duration: 300,
    })
}
export function rotateBack(obj) {
    let imageAnimationBack = anime({
        targets: obj,
        rotate: 0,
        duration: 300,
    })
}
function overlapping(div1, div2) {
    let rect1 = div1.getBoundingClientRect()
    let rect2 = div2.getBoundingClientRect()
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    )
}
export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}