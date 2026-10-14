/* Theme engine: runs in <head> so the saved look applies before the page paints. */
(function () {
    var KEY = 'tower-theme-v1';
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var defaults = { house: 'gryffindor', font: 'storybook', effect: reduce ? 'none' : 'leaves', custom: null };
    var state = Object.assign({}, defaults);

    try {
        var saved = JSON.parse(localStorage.getItem(KEY));
        if (saved) { state = Object.assign(state, saved); }
    } catch (e) { /* ignore */ }

    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

    function luminance(hex) {
        var n = parseInt(hex.replace('#', ''), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    function readable(hex, dark, light) { return luminance(hex) > 0.6 ? dark : light; }

    var CUSTOM_VARS = ['--bg', '--text', '--muted', '--primary', '--accent', '--on-primary', '--on-accent'];

    function apply() {
        root.setAttribute('data-house', state.house);
        root.setAttribute('data-font', state.font);
        CUSTOM_VARS.forEach(function (v) { root.style.removeProperty(v); });
        if (state.house === 'custom' && state.custom) {
            var c = state.custom, s = root.style;
            s.setProperty('--bg', c.bg);
            s.setProperty('--primary', c.primary);
            s.setProperty('--accent', c.accent);
            s.setProperty('--text', readable(c.bg, '#2b1a10', '#f4e8d0'));
            s.setProperty('--muted', 'color-mix(in srgb, var(--text) 68%, var(--bg))');
            s.setProperty('--on-primary', readable(c.primary, '#1d1208', '#fff6e6'));
            s.setProperty('--on-accent', readable(c.accent, '#1d1208', '#fff6e6'));
        }
    }
    apply();

    /* ---------- floating effects ---------- */
    var canvas, ctx, parts = [], raf = null, W = 0, H = 0;
    var GLYPHS = { leaves: ['\uD83C\uDF42', '\uD83C\uDF41', '\uD83C\uDF43', '\uD83C\uDF42'], candles: ['\uD83D\uDD6F\uFE0F'], sparkles: ['\u2728', '\u2B50', '\u2728'] };

    function rand(a, b) { return a + Math.random() * (b - a); }

    function makePart(kind, fresh) {
        var g = GLYPHS[kind];
        var p = { g: g[Math.floor(Math.random() * g.length)], x: rand(0, W), size: rand(18, 30), t: rand(0, 6.28), a: 1 };
        if (kind === 'leaves') {
            p.y = fresh ? rand(0, H) : -30; p.vy = rand(0.5, 1.4); p.sway = rand(0.5, 1.4); p.spin = rand(-0.02, 0.02); p.rot = rand(0, 6.28);
        } else if (kind === 'candles') {
            p.y = rand(40, H * 0.55); p.size = rand(26, 36); p.base = p.y;
        } else {
            p.y = rand(0, H); p.size = rand(12, 22);
        }
        return p;
    }

    function resize() { if (canvas) { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; } }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        parts.forEach(function (p, i) {
            p.t += 0.02;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = p.size + 'px serif';
            if (state.effect === 'leaves') {
                p.y += p.vy; p.x += Math.sin(p.t * p.sway) * 0.8; p.rot += p.spin;
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                if (p.y > H + 40) { parts[i] = makePart('leaves', false); }
            } else if (state.effect === 'candles') {
                ctx.translate(p.x, p.base + Math.sin(p.t) * 8);
                ctx.globalAlpha = 0.85 + Math.sin(p.t * 3) * 0.1;
            } else {
                ctx.translate(p.x, p.y);
                ctx.globalAlpha = Math.max(0, Math.sin(p.t * 1.5));
            }
            ctx.fillText(p.g, 0, 0);
            ctx.restore();
        });
        raf = requestAnimationFrame(frame);
    }

    function stopFx() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (canvas) { canvas.remove(); canvas = null; }
        parts = [];
    }

    function startFx() {
        stopFx();
        if (state.effect === 'none' || !GLYPHS[state.effect]) { return; }
        canvas = document.createElement('canvas');
        canvas.className = 'fx';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(canvas, document.body.firstChild);
        ctx = canvas.getContext('2d');
        resize();
        var n = Math.min(state.effect === 'candles' ? 10 : 26, Math.max(6, Math.round(W / 55)));
        for (var i = 0; i < n; i++) { parts.push(makePart(state.effect, true)); }
        raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        else if (canvas && !raf) { raf = requestAnimationFrame(frame); }
    });

    /* ---------- panel wiring ---------- */
    function syncUi() {
        var cs = getComputedStyle(root);
        function hex(v) { return cs.getPropertyValue(v).trim(); }
        function setPick(id, v) { var el = document.getElementById(id); var val = hex(v); if (el && /^#[0-9a-f]{6}$/i.test(val)) { el.value = val; } }
        setPick('pickBg', '--bg'); setPick('pickPrimary', '--primary'); setPick('pickAccent', '--accent');
        document.querySelectorAll('[data-house]').forEach(function (b) { if (b.classList.contains('chip')) { b.setAttribute('aria-pressed', String(b.dataset.house === state.house)); } });
        document.querySelectorAll('[data-font].chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.font === state.font)); });
        document.querySelectorAll('[data-effect]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.effect === state.effect)); });
    }

    function setHouse(name) { state.house = name; state.custom = null; apply(); save(); syncUi(); }

    window.TT = { setHouse: setHouse };

    document.addEventListener('DOMContentLoaded', function () {
        var panel = document.getElementById('themePanel');
        var btn = document.getElementById('themeBtn');
        function toggle(open) {
            panel.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
            if (open) { syncUi(); }
        }
        btn.addEventListener('click', function () { toggle(panel.hidden); });
        document.getElementById('themeClose').addEventListener('click', function () { toggle(false); btn.focus(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { toggle(false); btn.focus(); } });
        var heroBtn = document.getElementById('heroTheme');
        if (heroBtn) { heroBtn.addEventListener('click', function () { toggle(true); }); }

        document.querySelectorAll('#houseChips .chip').forEach(function (b) {
            b.addEventListener('click', function () { setHouse(b.dataset.house); });
        });
        document.querySelectorAll('#fontChips .chip').forEach(function (b) {
            b.addEventListener('click', function () { state.font = b.dataset.font; apply(); save(); syncUi(); });
        });
        document.querySelectorAll('#fxChips .chip').forEach(function (b) {
            b.addEventListener('click', function () { state.effect = b.dataset.effect; save(); syncUi(); startFx(); });
        });

        function onPick() {
            state.custom = {
                bg: document.getElementById('pickBg').value,
                primary: document.getElementById('pickPrimary').value,
                accent: document.getElementById('pickAccent').value
            };
            state.house = 'custom';
            apply(); save();
            document.querySelectorAll('#houseChips .chip').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        }
        ['pickBg', 'pickPrimary', 'pickAccent'].forEach(function (id) { document.getElementById(id).addEventListener('input', onPick); });

        document.getElementById('themeReset').addEventListener('click', function () {
            state = Object.assign({}, defaults);
            apply(); save(); syncUi(); startFx();
        });

        syncUi();
        startFx();
    });
})();
