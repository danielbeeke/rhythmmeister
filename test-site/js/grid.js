document.onkeydown = function(evt) {
    if (evt.ctrlKey && (evt.keyCode == 59 || evt.keyCode == 186)) {
        var newValue = document.body.getAttribute('grid') == 'visible' ? 'invisible' : 'visible';
        document.body.setAttribute('grid', newValue);
        localStorage.setItem('grid', newValue);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var initialGirdValue = localStorage.getItem('grid');
    document.body.setAttribute('grid', initialGirdValue);
});