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
    // .then(() => {
    //     return printList(packagesConflicts, {
    //         printItem: (item, isTagged) => {
    //             const postfix = isTagged ? `*${item.targetVersion}*` : `${item.version} -> ${item.targetVersion}`;
    //             return `${item.packageName}:${item.section} ${item.moduleName}: ${postfix}`;
    //         },
    //     }).then((tags) => {
    //         console.log('Packages', tags);
    //     });
    // })
    .then(() => {
        let moduleIndex = -1;
        const moduleVersions = new Map();
        let done = false;
        const printModules = () => {
            return printList(modulesConflicts, {
                printItem: (item, isTagged) => {
                    return `${item.moduleName} (${item.items.length})`;
                },
                handlers: {
                    'space': ({ focus, close }) => {
                        moduleIndex = focus;
                        close();
                    },
                    'enter': () => {
                        done = true;
                        close();
                    },
                },
            }).then(() => {
                if (!done) {
                    return printItems();
                }
            });
        };
        const printItems = () => {
            const version = moduleVersions.get(moduleIndex);
            let tag = version >= 0 ? version : -1;
            return printList(modulesConflicts[moduleIndex].items, {
                focus: tag >= 0 ? tag : undefined,
                tags: version >= 0 ? [version] : [],
                printItem: (item, isTagged) => {
                    return `${item.version} ${item.packages.length}`;
                },
                handlers: {
                    'space': ({ focus, toggleTag }) => {
                        toggleTag(tag);
                        toggleTag(focus);
                        tag = focus;
                    },
                    'backspace': ({ close }) => {
                        if (tag >= 0) {
                            moduleVersions.set(moduleIndex, tag);
                        } else {
                            moduleVersions.delete(moduleIndex);
                        }
                        close();
                    },
                },
            }).then(printModules);
        };
        return printModules();
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
