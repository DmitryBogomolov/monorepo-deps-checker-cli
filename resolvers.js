/* eslint-disable no-console */
const printList = require('cli-list-select');

function noop() { }

function showPackages(conflicts) {
    if (!conflicts.length) {
        console.log('No conflicts');
        return;
    }
    console.log(conflicts.length);
    conflicts.forEach((conflict) => {
        console.log(` ${conflict.packageName}:${conflict.section} ${conflict.moduleName} ${conflict.version} -> ${conflict.targetVersion}`);
    });
}

function showModules(conflicts) {
    if (!conflicts.length) {
        console.log('No conflicts');
        return;
    }
    console.log(conflicts.length);
    conflicts.forEach((conflict) => {
        console.log(` ${conflict.moduleName} (${conflict.items.length})`);
        conflict.items.forEach((item) => {
            console.log(`   ${item.version} (${item.packages.length})`);
        });
    });
}

function resolveAllPackages(conflicts) {
    conflicts.forEach(conflict => conflict.resolve());
}

function resolvePackagesByPrompt(conflicts) {
    if (!conflicts.length) {
        return null;
    }
    return printList(conflicts, {
        printItem: (item, i, isFocused, isChecked) => {
            const postfix = isChecked ? `*${item.targetVersion}*` : `${item.version} -> ${item.targetVersion}`;
            return `${item.packageName}:${item.section} ${item.moduleName}: ${postfix}`;
        },
    }).then(({ checks }) => {
        console.log('PACKAGES');
        checks.forEach((tag) => {
            const conflict = conflict[tag];
            console.log(`  ${conflict.packageName} ${conflict.targetVersion}`);
            conflict.resolve();
        });
    });
}

function resolveModulesByFrequent(conflicts) {
    conflicts.forEach(conflict => conflict.resolve(0));
}

function resolveModulesByNew(conflicts) {
    conflicts.forEach((conflict) => {
        const list = conflict.items.map(mapItem);
        list.sort(compareVersions);
        const choice = list[0].index;
        conflict.resolve(choice);
    });

    function mapItem(item, index) {
        return { index, version: item.version.match(/(\d+)/g) || [] };
    }

    function compareVersions(version1, version2) {
        const len = Math.min(version1.length, version2.length);
        for (let i = 0; i < len; ++i) {
            const d = version2[i] - version1[i];
            if (d !== 0) {
                return d;
            }
        }
        return version2.length - version1.length;
    }
}

function resolveModulesByPrompt(conflicts) {
    if (!conflicts.length) {
        return null;
    }
    let currentModuleIndex = -1;
    const moduleVersions = new Map();
    return printModules().then(() => {
        console.log('VERSIONS');
        moduleVersions.forEach((versionIndex, moduleIndex) => {
            const conflict = conflicts[moduleIndex];
            console.log(` ${conflict.moduleName} ${conflict.items[versionIndex].version}`);
            conflict.resolve(versionIndex);
        });
    });

    function closeList({ end }) {
        end(true);
    }

    function printModules() {
        return printList(conflicts, {
            index: currentModuleIndex,
            checks: moduleVersions.keys(),
            printItem: (item, i) => {
                const versionIndex = moduleVersions.get(i);
                const postfix = versionIndex >= 0 ?
                    `-> ${conflicts[currentModuleIndex].items[versionIndex].version}`
                    : '';
                return `${item.moduleName} (${item.items.length}) ${postfix}`;
            },
            handlers: {
                'space': closeList,
            },
        }).then(({ note, index }) => {
            if (note) {
                currentModuleIndex = index;
                return printItems();
            }
        });
    }

    function printItems() {
        const version = moduleVersions.get(currentModuleIndex);
        return printList(conflicts[currentModuleIndex].items, {
            index: version,
            checks: version,
            singleCheck: true,
            printItem: (item) => {
                const line = `${item.version} (${item.packages.length})`;
                const lines = item.packages
                    .map((pack) => `  ${pack.packageName}:${pack.section}`);
                return [line, ...lines].join('\n');
            },
            handlers: {
                'backspace': closeList,
            },
        }).then(({ note, checks }) => {
            if (!note) {
                if (checks >= 0) {
                    moduleVersions.set(currentModuleIndex, checks);
                } else {
                    moduleVersions.delete(currentModuleIndex);
                }
            }
            return printModules();
        });
    }
}

module.exports = {
    noop,
    showPackages,
    showModules,
    resolveAllPackages,
    resolvePackagesByPrompt,
    resolveModulesByNew,
    resolveModulesByFrequent,
    resolveModulesByPrompt,
};
