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

function clampIndex(value, count) {
    return 0 <= value && value < count ? Number(value) : NaN;
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
    const { objects, lineCount } = makeInfo(items);
    let focus = Number(options.focus) || 0;
    const tags = new Set(options.tags);
    const refresh = () => {
        clearList(lineCount);
        renderList(objects, focus, tags);
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
        renderList(objects, focus, tags);
    });
}

module.exports = printList;
