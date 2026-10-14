/* Stacks page: undo-typing demo and postfix examples */
(function () {
    /* ----- Undo typing: every character is a push, Undo is a pop ----- */
    var input = document.getElementById('undoInput');
    if (input) {
        var well = document.getElementById('undoStack');
        var msg = document.getElementById('undoMsg');
        var stack = [];

        function render(note) {
            well.innerHTML = '';
            if (!stack.length) {
                var p = document.createElement('p'); p.className = 'empty st-empty'; p.textContent = 'Empty stack'; well.appendChild(p);
            } else {
                var shown = stack.slice(-8).reverse();
                shown.forEach(function (ch, i) {
                    var node = document.createElement('div'); node.className = 'st-node' + (i === 0 ? ' is-top' : '');
                    if (i === 0) { var t = document.createElement('span'); t.className = 'st-top'; t.textContent = 'TOP'; node.appendChild(t); }
                    var d = document.createElement('span'); d.className = 'st-data'; d.textContent = ch === ' ' ? '(space)' : ch;
                    node.appendChild(d); well.appendChild(node);
                });
                if (stack.length > 8) {
                    var more = document.createElement('p'); more.className = 'small muted'; more.style.margin = '4px 0 0'; more.style.textAlign = 'center';
                    more.textContent = '+ ' + (stack.length - 8) + ' more below'; well.appendChild(more);
                }
            }
            msg.textContent = note || (stack.length ? stack.length + ' keystroke' + (stack.length === 1 ? '' : 's') + ' on the stack.' : 'Nothing typed yet.');
        }

        input.addEventListener('input', function () {
            stack = input.value.split('');
            render();
        });
        document.getElementById('undoBtn').addEventListener('click', function () {
            if (!stack.length) { render('Nothing to undo. The stack is empty.'); return; }
            var popped = stack.pop();
            input.value = stack.join('');
            render('Popped "' + (popped === ' ' ? '(space)' : popped) + '". The text is now "' + input.value + '".');
            input.focus();
        });
        document.getElementById('undoClear').addEventListener('click', function () {
            stack = []; input.value = ''; render(); input.focus();
        });
        render();
    }

    /* ----- Postfix: click an example to fill the box ----- */
    var expr = document.getElementById('exprInput');
    document.querySelectorAll('[data-example]').forEach(function (b) {
        b.addEventListener('click', function () { expr.value = b.dataset.example; expr.focus(); });
    });
})();
