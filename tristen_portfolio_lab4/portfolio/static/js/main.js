/* Shared behaviour for every page */
(function () {
    function toast(message) {
        var box = document.querySelector('.toasts');
        var el = document.createElement('div');
        el.className = 'toast toast-ok';
        el.textContent = message;
        box.appendChild(el);
        setTimeout(function () { el.remove(); }, 2200);
    }
    window.TT = window.TT || {};
    window.TT.toast = toast;

    /* flash messages fade away, or click to dismiss */
    document.querySelectorAll('.toast').forEach(function (el) {
        el.addEventListener('click', function () { el.remove(); });
        setTimeout(function () { el.remove(); }, 6000);
    });

    /* chibi speech bubbles: tap to hear the next line */
    document.querySelectorAll('.chibi[data-says]').forEach(function (el) {
        var lines = el.dataset.says.split('|');
        var bubble = el.querySelector('.bubble');
        var i = 0, timer;
        el.addEventListener('click', function () {
            i = (i + 1) % lines.length;
            bubble.textContent = lines[i];
            el.classList.add('is-talking');
            clearTimeout(timer);
            timer = setTimeout(function () { el.classList.remove('is-talking'); }, 3500);
        });
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
    });

    /* copy buttons */
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
        return Promise.resolve();
    }
    document.querySelectorAll('[data-copy]').forEach(function (b) {
        b.addEventListener('click', function () { copyText(b.dataset.copy).then(function () { toast('Copied'); }); });
    });
    document.querySelectorAll('[data-copy-target]').forEach(function (b) {
        b.addEventListener('click', function () {
            var target = document.querySelector(b.dataset.copyTarget);
            copyText(target.textContent).then(function () { toast('Copied'); });
        });
    });

    /* show/hide (profile edit form) */
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
            var target = document.querySelector(b.dataset.toggle);
            target.hidden = !target.hidden;
            document.querySelectorAll('[data-toggle="' + b.dataset.toggle + '"][aria-expanded]').forEach(function (t) {
                t.setAttribute('aria-expanded', String(!target.hidden));
            });
            if (!target.hidden) { var first = target.querySelector('input, textarea'); if (first) { first.focus(); } }
        });
    });

    /* ask before destructive actions */
    document.querySelectorAll('form[data-confirm]').forEach(function (f) {
        f.addEventListener('submit', function (e) { if (!confirm(f.dataset.confirm)) { e.preventDefault(); } });
    });

    /* upload as soon as a file is chosen */
    document.querySelectorAll('input[data-autosubmit]').forEach(function (input) {
        input.addEventListener('change', function () { if (input.files.length) { input.form.submit(); } });
    });

    /* drag and drop for code uploads */
    var drop = document.getElementById('dropzone');
    if (drop) {
        var input = drop.querySelector('input[type=file]');
        ['dragenter', 'dragover'].forEach(function (ev) {
            drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
        });
        drop.addEventListener('drop', function (e) {
            if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; drop.submit(); }
        });
    }

    /* Work tabs: switch instantly, links still work without JavaScript */
    var tabs = document.querySelectorAll('.tabs [data-tab]');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
            document.querySelectorAll('.panel').forEach(function (p) {
                p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab);
            });
            history.replaceState(null, '', tab.getAttribute('href'));
            var first = document.querySelector('.panel.is-active input:not([type=hidden]), .panel.is-active textarea');
            if (first) { first.focus(); }
        });
    });
})();
