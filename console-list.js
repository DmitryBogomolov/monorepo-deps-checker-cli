const rl = require('readline');[]

const cin = process.stdin;
const cout = process.stdout;

const ESC = '\u001b';
const CTRLC = '\u0003';

rl.emitKeypressEvents(cin);

function clampIndex(value, count) {
    return 0 <= value && value < count ? Number(value) : NaN;
}

function renderList(items, printItem, focus, tags) {
    let lineCount = 0;
    items.forEach((item, i) => {
        const lines = printItem(item, tags.has(i)).split('\n');
        lineCount += lines.length;
        const focusCh = i === focus ? '-' : ' ';
        const tagCh = tags.has(i) ? '*' : ' ';
        const prefix = `${focusCh}[${tagCh}] `;
        const dumb = ' '.repeat(prefix.length);
        cout.write(`${prefix}${lines[0]}\n`);
        lines.slice(1).forEach((line) => {
            cout.write(`${dumb}${line}\n`);
        });
    });
    return lineCount;
}

function clearList(lineCount) {
    for (let i = 0; i < lineCount; ++i) {
        rl.moveCursor(cout, 0, -1);
        rl.clearLine(cout, 0);
    }
}

const defaultHandlers = {
    'up': ({ focus, setFocus }) => {
        setFocus(focus - 1);
    },
    'down': ({ focus, setFocus }) => {
        setFocus(focus + 1);
    },
    'space': ({ focus, toggleTag }) => {
        toggleTag(focus);
    },
    'return': ({ close }) => {
        close();
    },
};

function printList(items, options = {}) {
    const printItem = options.printItem || String;
    let lineCount = 0;
    let focus = Number(options.focus) || 0;
    const tags = new Set(options.tags);
    const refresh = () => {
        clearList(lineCount);
        lineCount = renderList(items, printItem, focus, tags);
    };
    const setFocus = (value) => {
        const newFocus = clampIndex(value, items.length);
        if (isFinite(newFocus) && newFocus !== focus) {
            focus = newFocus;
            refresh();
        }
    };
    const toggleTag = (value) => {
        const tag = clampIndex(value, items.length);
        if (isFinite(tag)) {
            tags[tags.has(tag) ? 'delete' : 'add'](tag);
            refresh();
        }
    };
    return new Promise((resolve, reject) => {
        const dispose = () => {
            cin.off('keypress', handle);
            cin.setRawMode(false);
        };
        const close = () => {
            dispose();
            resolve(tags);
        };
        const handlers = Object.assign({}, defaultHandlers, options.handlers);
        const handle = (key, data) => {
            if (data.sequence === ESC || data.sequence === CTRLC) {
                dispose();
                reject(new Error('Canceled'));
                return;
            }
            const handler = handlers[data.name];
            if (handler) {
                handler({ focus, setFocus, toggleTag, close });
            }
        };
        cin.setRawMode(true);
        cin.on('keypress', handle);
        lineCount = renderList(items, printItem, focus, tags);
    });
}

module.exports = printList;
