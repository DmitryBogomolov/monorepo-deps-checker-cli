#!/usr/bin/env node

const check = require('monorepo-deps-checker');
const printList = require('./console-list');

function resolvePackagesVersions(conflicts) {

}

function resolveModulesVersions(conflicts) {

}

const packagesConflicts = [
    { packageName: 'pack-1', section: 'dependencies', moduleName: 'mod-1', version: '1.0', targetVersion: '2.1' },
    { packageName: 'pack-2', section: 'dependencies', moduleName: 'mod-2', version: '1.1', targetVersion: '2.2' },
    { packageName: 'pack-3', section: 'dependencies', moduleName: 'mod-3', version: '1.1', targetVersion: '1.2' },
    { packageName: 'pack-4', section: 'dependencies', moduleName: 'mod-4', version: '2.1', targetVersion: '1.4' },
];

const modulesConflicts = [
    {
        moduleName: 'mod-1',
        items: [
            {
                version: '1.1',
                packages: [
                    { packageName: 'p-1', section: 'dependencies' },
                    { packageName: 'p-2', section: 'dependencies' },
                ]
            },
            {
                version: '1.3',
                packages: [
                    { packageName: 'p-3', section: 'dependencies' },
                ]
            },
        ]
    },
    {
        moduleName: 'mod-2',
        items: [
            {
                version: '1.4',
                packages: [
                    { packageName: 'p-1', section: 'dependencies' },
                    { packageName: 'p-2', section: 'dependencies' },
                ]
            },
            {
                version: '1.8',
                packages: [
                    { packageName: 'p-3', section: 'dependencies' },
                ]
            },
        ]
    },
];

Promise.resolve()
    .then(() => {
        return printList(packagesConflicts, {
            printItem: (item, i, isTagged) => {
                const postfix = isTagged ? `*${item.targetVersion}*` : `${item.version} -> ${item.targetVersion}`;
                return `${item.packageName}:${item.section} ${item.moduleName}: ${postfix}`;
            },
        }).then(({ tags }) => {
            console.log('PACKAGES');
            tags.forEach((tag) => {
                const conflict = packagesConflicts[tag];
                console.log(conflict.packageName, conflict.targetVersion);
            });
        });
    })
    .then(() => {
        let currentModuleIndex = -1;
        const moduleVersions = new Map();
        const printModules = () => {
            return printList(modulesConflicts, {
                index: currentModuleIndex,
                tags: moduleVersions.keys(),
                printItem: (item, i, isTagged) => {
                    const versionIndex = moduleVersions.get(i);
                    const postfix = versionIndex >= 0 ?
                        `-> ${modulesConflicts[currentModuleIndex].items[versionIndex].version}`
                        : '';
                    return `${item.moduleName} (${item.items.length}) ${postfix}`;
                },
                handlers: {
                    'space': ({ close }) => close(1),
                },
            }).then(({ status, index }) => {
                if (status) {
                    currentModuleIndex = index;
                    return printItems();
                }
            });
        };
        const printItems = () => {
            const version = moduleVersions.get(currentModuleIndex);
            return printList(modulesConflicts[currentModuleIndex].items, {
                index: version,
                tags: version,
                singleTag: true,
                printItem: (item, isTagged) => {
                    const line = `${item.version} (${item.packages.length})`;
                    const lines = item.packages
                        .map((pack) => `  ${pack.packageName}:${pack.section}`);
                    return [line, ...lines].join('\n');
                },
                handlers: {
                    'backspace': ({ close }) => close(1),
                },
            }).then(({ status, tags }) => {
                if (!status) {
                    if (tags >= 0) {
                        moduleVersions.set(currentModuleIndex, tags);
                    } else {
                        moduleVersions.delete(currentModuleIndex);
                    }
                }
                return printModules();
            });
        };
        return printModules().then(() => {
            console.log('VERSIONS');
            moduleVersions.forEach((versionIndex, moduleIndex) => {
                const conflict = modulesConflicts[moduleIndex];
                console.log(conflict.moduleName, conflict.items[versionIndex].version);
            });
        });
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

// const repoDir = process.argv[2] || '.';
// check(repoDir, resolvePackagesVersions, resolveModulesVersions).then(
//     () => {
//         console.log('DONE');
//     },
//     (err) => {
//         console.error(err);
//         process.exit(1);
//     }
// );
