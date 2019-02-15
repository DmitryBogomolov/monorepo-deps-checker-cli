const rl = require('readline');[]

const cin = process.stdin;
const cout = process.stdout;

const ESC = '\u001b';
const CTRLC = '\u0003';

rl.emitKeypressEvents(cin);

function renderList(items, focus, selection) {
    items.forEach((item, i) => {
        const focusCh = i === focus ? '-' : ' ';
        const selectCh = selection.has(i) ? '*' : ' ';
        cout.write(`${focusCh}[${selectCh}] ${item}\n`);
    });
}

function clearList(items) {
    items.forEach(() => {
        rl.moveCursor(cout, 0, -1);
        rl.clearLine(cout, 0);
    });
}

function showList(items, initialSelection) {
    cin.setRawMode(true);
    return new Promise((resolve, reject) => {
        let focus = 0;
        const selection = new Set(initialSelection);
        function handle(key, data) {
            if (data.sequence === ESC || data.sequence === CTRLC) {
                reject(new Error('Canceled'));
                cin.setRawMode(false);
                return;
            }
            let newFocus = focus;
            switch(data.name) {
                case 'up':
                    newFocus = Math.max(focus - 1, 0);
                    break;
                case 'down':
                    newFocus = Math.min(focus + 1, items.length - 1);
                    break;
                case 'return':
                    cin.off('keypress', handle);
                    resolve(focus);
                    cin.setRawMode(false);
                    return;
            }
            if (newFocus !== focus) {
                focus = newFocus;
                clearList(items);
                renderList(items, focus, selection);
            }
        };
        cin.on('keypress', handle);
        renderList(items, focus, selection);
    });
}

module.exports = showList;
