/* eslint-disable no-console */
const printList = require('cli-list-select');

function resolve(name, conflicts, selectConflicts, resolveConflicts) {
    console.log(`* ${name} *`);
    if (!conflicts.length) {
        console.log('no conflicts');
        return null;
    }
    console.log(`conflicts (${conflicts.length})`);
    return Promise.resolve(selectConflicts(conflicts)).then(resolveConflicts);
}

function resolvePackages(selectConflicts, conflicts) {
    return resolve('PACKAGES', conflicts, selectConflicts, resolvePackageConflicts);
}

function resolvePackageConflicts(conflicts) {
    conflicts.forEach((conflict) => {
        console.log(`  ${conflict.packageName} ${conflict.targetVersion}`);
        conflict.resolve();
    });
}

function getPackageDesc(conflict) {
    return `${conflict.packageName}:${conflict.section} ${conflict.moduleName}`;
}

function getPackageVersionDesc(conflict) {
    return `${conflict.version} -> ${conflict.targetVersion}`;
}

function showAllPackages(conflicts) {
    conflicts.forEach((conflict) => {
        console.log(` ${getPackageDesc(conflict)} ${getPackageVersionDesc(conflict)}`);
    });
    return [];
}

function selectAllPackages(conflicts) {
    return conflicts;
}

function selectPackagesByPrompt(conflicts) {
    return printList(conflicts, {
        printItem: (item, i, isFocused, isChecked) => {
            const postfix = isChecked ? `*${item.targetVersion}*` : getPackageVersionDesc(item);
            return `${getPackageDesc(item)}: ${postfix}`;
        },
    }).then(({ checks }) => checks.map(tag => conflicts[tag]));
}

function resolveModules(selectConflicts, conflicts) {
    return resolve('MODULES', conflicts, selectConflicts, resolveModulesConflicts);
}

function resolveModulesConflicts(list) {
    list.forEach(([conflict, choice]) => {
        console.log(` ${conflict.moduleName} ${conflict.items[choice].version}`);
        conflict.resolve(choice);
    });
}

function getModuleDesc(conflict) {
    return `${conflict.moduleName} (${conflict.items.length})`;
}

function getModuleVersionDesc(item) {
    return `${item.version} (${item.packages.length})`;
}

function showAllModules(conflicts) {
    conflicts.forEach((conflict) => {
        console.log(` ${getModuleDesc(conflict)}`);
        conflict.items.forEach((item) => {
            console.log(`   ${getModuleVersionDesc(item)}`);
        });
    });
    return [];
}

function selectModulesByFrequent(conflicts) {
    return conflicts.map(conflict => [conflict, 0]);
}

function selectModulesByNew(conflicts) {
    return conflicts.map((conflict) => {
        const list = conflict.items.map(mapItem);
        list.sort(compareVersions);
        const choice = list[0].index;
        return [conflict, choice];
    });

    function mapItem(item, index) {
        return { index, version: item.version.match(/(\d+)/g) || [] };
    }

    function compareVersions({ version: version1 }, { version: version2 }) {
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

function selectModulesByPrompt(conflicts) {
    let currentModuleIndex = -1;
    const moduleVersions = new Map();
    return printModules().then(() => {
        const result = [];
        moduleVersions.forEach((versionIndex, moduleIndex) => {
            result.push([conflicts[moduleIndex], versionIndex]);
        });
        return result;
    });

    function closeList({ end }) {
        end(true);
    }

    function printModules() {
        return printList(conflicts, {
            index: currentModuleIndex,
            checks: Array.from(moduleVersions.keys()),
            printItem: (item, i) => {
                const versionIndex = moduleVersions.get(i);
                const postfix = versionIndex >= 0 ?
                    `-> ${conflicts[currentModuleIndex].items[versionIndex].version}`
                    : '';
                return `${getModuleDesc(item)} ${postfix}`;
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
                const line = getModuleVersionDesc(item);
                const lines = item.packages.map(pack => `  ${pack.packageName}:${pack.section}`);
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
    showPackages: conflicts => resolvePackages(showAllPackages, conflicts),
    showModules: conflicts => resolveModules(showAllModules, conflicts),
    resolveAllPackages: conflicts => resolvePackages(selectAllPackages, conflicts),
    resolvePackagesByPrompt: conflicts => resolvePackages(selectPackagesByPrompt, conflicts),
    resolveModulesByNew: conflicts => resolveModules(selectModulesByNew, conflicts),
    resolveModulesByFrequent: conflicts => resolveModules(selectModulesByFrequent, conflicts),
    resolveModulesByPrompt: conflicts => resolveModules(selectModulesByPrompt, conflicts),
};
