let currentPanel = 0
let scrollBody = $('html, body')
let canScroll = true
let numberPanels
let panels
let previousDirection = 1
let animationTime = 1000
let scrollTime = 400
$(document).ready(function() {
    scrollBody.scrollTop(0)
    panels = $('.panel')
    numberPanels = panels.length
    for (let i = 0; i < numberPanels; i++) {
        let button = $('<button class="scrollMenuButton"></button>')
        button.on('click', function() {
            scrollTo(i)
        })
        $('#scrollMenu').append(button)
        panels.eq(i).css('z-index', numberPanels-i)
    }
    updateScrollMenuButtons()
    $(document).on('wheel touchmove', function(event) {
        if (!canScroll) return
        let scrollDirection = event.originalEvent.deltaY < 0 ? -1 : 1
        let goingToPanel = currentPanel + scrollDirection
        if (goingToPanel === -1 || goingToPanel === numberPanels) return

        let animatingPanel = currentPanel
        let rechargeTime = scrollTime
        if (scrollDirection === -1) animatingPanel -= 1
        animatePanel(animatingPanel, scrollDirection)
        canScroll = false
        setTimeout(function() {
            canScroll = true
        }, rechargeTime)
    })
})
function scrollTo(n) {
    let scrollDirection = 1
    if (n <= currentPanel) scrollDirection = -1
    if (scrollDirection === 1) {
        for (let i = currentPanel; i < n; i++) {
            setTimeout(function() {
                animatePanel(i, scrollDirection)
            }, (i - currentPanel)*scrollTime)
        }
    }
    else {
        for (let i = currentPanel - 1; i >= n; i--) {
            setTimeout(function() {
                animatePanel(i, scrollDirection)
            }, (currentPanel - i - 1)*scrollTime)
        }
    }
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