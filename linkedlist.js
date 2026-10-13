/* Linked list page: pick an insert spot and preview the result */
(function () {
    var board = document.getElementById('llBoard');
    if (!board) { return; }
    var items = JSON.parse(board.dataset.items);
    var pos = document.getElementById('addPos');
    var val = document.getElementById('addValue');
    var out = document.getElementById('llPreview');
    var slots = board.querySelectorAll('.ll-slot');

    function q(t) { return '\u201c' + t + '\u201d'; }

    function update() {
        var n = parseInt(pos.value, 10);
        slots.forEach(function (s) { s.classList.toggle('is-picked', parseInt(s.dataset.pos, 10) === n); });
        if (!pos.value) { out.textContent = ''; return; }
        if (isNaN(n) || n < 1 || n > items.length + 1) {
            out.textContent = 'Position must be between 1 and ' + (items.length + 1) + '.';
            return;
        }
        var name = q(val.value.trim() || 'new node');
        var before = n > 1 ? items[n - 2] : null;
        var after = n <= items.length ? items[n - 1] : null;
        var msg;
        if (!items.length) { msg = name + ' will be the only node.'; }
        else if (before && after) { msg = name + ' will become position ' + n + ', between ' + q(before) + ' and ' + q(after) + '. ' + q(before) + ' will point to it, and it will point to ' + q(after) + '.'; }
        else if (after) { msg = name + ' will become the new head and point to ' + q(after) + '.'; }
        else { msg = name + ' will become the new tail. ' + q(before) + ' will point to it, and it will point to NULL.'; }
        out.textContent = msg;
    }

    slots.forEach(function (s) {
        s.addEventListener('click', function () {
            pos.value = s.dataset.pos;
            update();
            (val.value.trim() ? pos : val).focus();
        });
    });
    pos.addEventListener('input', update);
    val.addEventListener('input', update);
})();
