#!/usr/bin/env node

const check = require('monorepo-deps-checker');
const printList = require('cli-list-select');
const commander = require('commander');
const packageInfo = require('./package');

function showPackages(conflicts) {
    if (!conflicts.length) {
        console.log('No conflicts');
        return;
    }
    console.log(conflicts.length);
    conflicts.forEach((conflict) => {
        console.log(` ${conflict.packageName}:${conflict.section} ${conflict.moduleName} ${conflict.version} -> ${conflict.targetVersion}`)
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

function forceResolvePackages(conflicts) {
    conflicts.forEach(conflict => conflict.resolve());
}

function promptResolvePackages(conflicts) {
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

function promptResolveModules(conflicts) {
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

    function printModules() {
        return printList(conflicts, {
            index: currentModuleIndex,
            checks: moduleVersions.keys(),
            printItem: (item, i, isFocused, isChecked) => {
                const versionIndex = moduleVersions.get(i);
                const postfix = versionIndex >= 0 ?
                    `-> ${conflicts[currentModuleIndex].items[versionIndex].version}`
                    : '';
                return `${item.moduleName} (${item.items.length}) ${postfix}`;
            },
            handlers: {
                'space': ({ end }) => end(1),
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
            printItem: (item, i, isFocused, isChecked) => {
                const line = `${item.version} (${item.packages.length})`;
                const lines = item.packages
                    .map((pack) => `  ${pack.packageName}:${pack.section}`);
                return [line, ...lines].join('\n');
            },
            handlers: {
                'backspace': ({ end }) => end(1),
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

// const packagesConflicts = [
//     { packageName: 'pack-1', section: 'dependencies', moduleName: 'mod-1', version: '1.0', targetVersion: '2.1' },
//     { packageName: 'pack-2', section: 'dependencies', moduleName: 'mod-2', version: '1.1', targetVersion: '2.2' },
//     { packageName: 'pack-3', section: 'dependencies', moduleName: 'mod-3', version: '1.1', targetVersion: '1.2' },
//     { packageName: 'pack-4', section: 'dependencies', moduleName: 'mod-4', version: '2.1', targetVersion: '1.4' },
// ];

// const modulesConflicts = [
//     {
//         moduleName: 'mod-1',
//         items: [
//             {
//                 version: '1.1',
//                 packages: [
//                     { packageName: 'p-1', section: 'dependencies' },
//                     { packageName: 'p-2', section: 'dependencies' },
//                 ]
//             },
//             {
//                 version: '1.3',
//                 packages: [
//                     { packageName: 'p-3', section: 'dependencies' },
//                 ]
//             },
//         ]
//     },
//     {
//         moduleName: 'mod-2',
//         items: [
//             {
//                 version: '1.4',
//                 packages: [
//                     { packageName: 'p-1', section: 'dependencies' },
//                     { packageName: 'p-2', section: 'dependencies' },
//                 ]
//             },
//             {
//                 version: '1.8',
//                 packages: [
//                     { packageName: 'p-3', section: 'dependencies' },
//                 ]
//             },
//         ]
//     },
// ];

function selectCallbacks(options) {
    if (options.printPackages) {
        return [showPackages, null];
    }
    if (options.printModules) {
        return [null, showModules];
    }
    let resolvePackages;
    if (options.skipPackages) {
        resolvePackages = null;
    } else if (options.resolvePackages) {
        resolvePackages = forceResolvePackages;
    } else {
        resolvePackages = promptResolvePackages;
    }
    let resolveModules;
    if (options.skipModules) {
        resolveModules = null;
    } else if (options.takeNewModule) {
        resolveModules = resolveModulesByNew;
    } else if (options.takeFrequentModule) {
        resolveModules = resolveModulesByFrequent;
    } else {
        resolveModules = promptResolveModules;
    }
    return [resolvePackages, resolveModules];
}

commander
    .version(packageInfo.version)
    .option('--print-packages', 'Print packages conflicts')
    .option('--print-modules', 'Print modules conflicts')
    .option('--skip-packages', 'Skip packages conflicts')
    .option('--skip-modules', 'Skip modules conflicts')
    .option('--resolve-packages', 'Resolve all packages conflicts')
    .option('--take-new-module', 'Resolve module conflicts with newest version')
    .option('--take-frequent-module', 'Resolve module conflicts with most frequent version')
    .option('--ignore [ignoredModules]', 'Ignore list for modules', arg => arg.split(','))
    .parse(process.argv);

if (!commander.args.length) {
    commander.help();
}

const pathToDir = commander.args[0];
const [processPackages, processModules] = selectCallbacks(commander);

check(pathToDir, processPackages, processModules).then(
    () => {
        console.log('DONE');
    },
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
