/* Fun page: Sorting Hat, spell caster, crystal ball, pumpkin patch */
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
    function retrigger(el, cls) { el.classList.remove(cls); void el.offsetWidth; if (!reduce) { el.classList.add(cls); } }

    /* ---------- Sorting Hat ---------- */
    var HOUSES = {
        gryffindor: { name: 'Gryffindor', text: 'Brave and bold. You run toward the problem and fix it on the way.' },
        hufflepuff: { name: 'Hufflepuff', text: 'Loyal and kind. Your team does its best work because you are in it.' },
        ravenclaw:  { name: 'Ravenclaw',  text: 'Curious and clever. You read the docs for fun and it shows.' },
        slytherin:  { name: 'Slytherin',  text: 'Ambitious and resourceful. You always find the elegant shortcut.' }
    };
    var QUESTIONS = [
        { q: 'The autumn path splits in two. What do you do?', a: [
            ['Charge down the darker path', 'gryffindor'], ['Wait so a friend can catch up', 'hufflepuff'],
            ['Check the map first', 'ravenclaw'], ['Look for the shortcut nobody else uses', 'slytherin']] },
        { q: 'Your code breaks at 2 a.m. What now?', a: [
            ['Keep trying fixes until it works', 'gryffindor'], ['Message a classmate to debug together', 'hufflepuff'],
            ['Read the documentation carefully', 'ravenclaw'], ['Find a clever workaround', 'slytherin']] },
        { q: 'Pick an autumn treat.', a: [
            ['Spiced cider', 'gryffindor'], ['Caramel apple', 'hufflepuff'],
            ['Hot cocoa and a good book', 'ravenclaw'], ['Dark chocolate', 'slytherin']] },
        { q: 'Your group project needs a leader.', a: [
            ['I will do it', 'gryffindor'], ['Let me make sure everyone is heard', 'hufflepuff'],
            ['I will plan the structure', 'ravenclaw'], ['I will make sure we hit the goal', 'slytherin']] },
        { q: 'Choose a companion.', a: [
            ['A phoenix', 'gryffindor'], ['A loyal dog', 'hufflepuff'],
            ['A wise owl', 'ravenclaw'], ['A sleek black cat', 'slytherin']] }
    ];
    var hat = document.getElementById('hat');
    var score, step;

    function askQuestion() {
        var item = QUESTIONS[step];
        hat.innerHTML = '';
        var prog = document.createElement('p'); prog.className = 'hat-progress'; prog.textContent = 'Question ' + (step + 1) + ' of ' + QUESTIONS.length;
        var q = document.createElement('p'); q.className = 'hat-q'; q.textContent = item.q;
        var box = document.createElement('div'); box.className = 'hat-answers';
        item.a.forEach(function (ans) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'btn btn-quiet'; b.textContent = ans[0];
            b.addEventListener('click', function () { score[ans[1]]++; step++; step < QUESTIONS.length ? askQuestion() : showResult(); });
            box.appendChild(b);
        });
        hat.append(prog, q, box);
        box.querySelector('button').focus();
    }

    function showResult() {
        var best = 'gryffindor';
        Object.keys(HOUSES).forEach(function (k) { if (score[k] > score[best]) { best = k; } });
        var h = HOUSES[best];
        hat.innerHTML = '';
        var box = document.createElement('div'); box.className = 'hat-result'; box.setAttribute('role', 'status');
        var title = document.createElement('h3'); title.textContent = h.name + '!';
        var text = document.createElement('p'); text.textContent = h.text;
        var row = document.createElement('div'); row.className = 'row';
        var wear = document.createElement('button'); wear.type = 'button'; wear.className = 'btn'; wear.textContent = 'Wear ' + h.name + ' colors';
        wear.addEventListener('click', function () { window.TT.setHouse(best); window.TT.toast('Theme changed to ' + h.name); });
        var again = document.createElement('button'); again.type = 'button'; again.className = 'btn btn-quiet'; again.textContent = 'Try again';
        again.addEventListener('click', startHat);
        row.append(wear, again);
        box.append(title, text, row);
        hat.appendChild(box);
    }

    function startHat() { score = { gryffindor: 0, hufflepuff: 0, ravenclaw: 0, slytherin: 0 }; step = 0; askQuestion(); }
    document.getElementById('hatStart').addEventListener('click', startHat);

    /* ---------- Spell caster ---------- */
    var SPELLS = [
        ['Compilus Maxima', 'Your code compiles on the very first try.'],
        ['Indentio Perfecto', 'Every tab and space lines up. No more IndentationError.'],
        ['Semicolonus Revelio', 'Reveals the one missing semicolon hiding in your file.'],
        ['Nullus Banishus', 'Banishes the dreaded null pointer for one whole day.'],
        ['Loopus Finitus', 'Ends the infinite loop before the fan starts screaming.'],
        ['Mergeo Pacificus', 'Resolves a git merge conflict peacefully.'],
        ['Cachus Clearus', 'Clears the stale cache that was causing all the trouble.'],
        ['Stackus Overflowa', 'Summons the exact answer you needed. First link, no scrolling.'],
        ['Savius Maximus', 'Saves your file one second before the power goes out.'],
        ['Wifius Returnus', 'Brings the Wi-Fi back during your online exam.']
    ];
    var out = document.getElementById('spellOut');
    document.getElementById('castBtn').addEventListener('click', function () {
        var s = pick(SPELLS);
        out.innerHTML = '';
        var n = document.createElement('p'); n.className = 'spell-name'; n.textContent = s[0];
        var e = document.createElement('p'); e.className = 'spell-effect'; e.textContent = s[1];
        out.append(n, e);
        retrigger(out, 'cast');
    });

    /* ---------- Crystal ball ---------- */
    var ANSWERS = ['It is certain.', 'Without a doubt.', 'Yes, definitely.', 'Most likely.', 'The leaves say yes.',
                   'Ask again after coffee.', 'The mist is thick. Try again.', 'Cannot tell right now.',
                   'Do not count on it.', 'My sources say no.', 'Very doubtful.', 'The owls say no.'];
    var ball = document.getElementById('ball'), ballText = document.getElementById('ballAnswer');
    function ask() { ballText.textContent = pick(ANSWERS); retrigger(ball, 'shake'); }
    document.getElementById('ballBtn').addEventListener('click', ask);
    document.getElementById('ballQ').addEventListener('keydown', function (e) { if (e.key === 'Enter') { ask(); } });

    /* ---------- Pumpkin patch ---------- */
    var KEY = 'tower-points', pointsEl = document.getElementById('points'), msgEl = document.getElementById('pointsMsg');
    var points = 0;
    try { points = parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { /* ignore */ }
    var MILESTONES = { 10: 'Ten points! The pumpkin is smiling.', 50: 'Fifty! Professor Pumpkin is impressed.', 100: 'One hundred points. Legendary harvest.', 250: 'Two hundred fifty! You own the patch.' };
    function render(msg) { pointsEl.textContent = points; if (msg) { msgEl.textContent = msg; } }
    render();
    document.getElementById('pumpkinBtn').addEventListener('click', function () {
        points++;
        try { localStorage.setItem(KEY, points); } catch (e) { /* ignore */ }
        render(MILESTONES[points] || 'Plus one house point!');
    });
    document.getElementById('pointsReset').addEventListener('click', function () {
        points = 0;
        try { localStorage.setItem(KEY, 0); } catch (e) { /* ignore */ }
        render('Fresh patch. Tap to begin.');
    });
})();
