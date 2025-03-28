window.openMail = function(t) {
    document.getElementById('mail-item-' + t).classList.toggle('active');
}
let viewed = 47;
let clicked = 14;
window.incrementClick = function() {
    clicked++;
    document.getElementById('roi-tracking').innerText = "\nThis ad was viewed 47 times.\n" +
        "\n" +
        "                Clicked " + clicked + " times.\n" +
        "\n" +
        "                At a click rate of " + (clicked/viewed*100).toFixed(1) + "%.";
}