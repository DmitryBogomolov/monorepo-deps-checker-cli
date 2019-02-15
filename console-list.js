const rl = require('readline');[]

const cin = process.stdin;
const cout = process.stdout;

const ESC = '\u001b';
const CTRLC = '\u0003';

rl.emitKeypressEvents(cin);

function makeInfo(items) {
    let lineCount = 0;
    const objects = items.map((item) => {
        const lines = item.split('\n');
        lineCount += lines.length;
        return { lines };
    });
    return { objects, lineCount };
}

function renderList(items, focus, selection) {
    items.forEach(({ lines }, i) => {
        const focusCh = i === focus ? '-' : ' ';
        const selectCh = selection.has(i) ? '*' : ' ';
        const prefix = `${focusCh}[${selectCh}] `;
        const dumb = ' '.repeat(prefix.length);
        cout.write(`${prefix}${lines[0]}\n`);
        lines.slice(1).forEach((line) => {
            cout.write(`${dumb}${line}\n`);
        });
    });
}

function clearList(lineCount) {
    for (let i = 0; i < lineCount; ++i) {
        rl.moveCursor(cout, 0, -1);
        rl.clearLine(cout, 0);
    }
}

function showList(items, initialSelection) {
    cin.setRawMode(true);
    const { objects, lineCount } = makeInfo(items);
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
                clearList(lineCount);
                renderList(objects, focus, selection);
            }
        };
        cin.on('keypress', handle);
        renderList(objects, focus, selection);
    });
}

module.exports = showList;
