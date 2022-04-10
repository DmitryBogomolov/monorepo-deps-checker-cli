#!/usr/bin/env node

/* eslint-disable no-console */

const check = require('monorepo-deps-checker');
const commander = require('commander');
const packageInfo = require('./package');
const {
    showPackages,
    showModules,
    resolveAllPackages,
    resolvePackagesByPrompt,
    resolveModulesByNew,
    resolveModulesByFrequent,
    resolveModulesByPrompt,
} = require('./resolvers');
const {
    ignorePackages,
    ignoreModules,
    ignoreModulePackages,
} = require('./filters');

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

function noop() { }

function combineFilter(filter, process) {
    return conflicts => process(filter(conflicts));
}

function selectPackagesProcessor(options) {
    let process;
    if (options.skipPackages) {
        process = noop;
    } else if (options.print) {
        process = showPackages;
    } else if (options.resolvePackages) {
        process = resolveAllPackages;
    } else {
        process = resolvePackagesByPrompt;
    }
    if (options.ignorePackages) {
        process = combineFilter(ignorePackages.bind(null, options.ignorePackages), process);
    }
    return process;
}

function selectModulesProcessor(options) {
    let process;
    if (options.skipModules) {
        process = noop;
    } else if (options.print) {
        process = showModules;
    } else if (options.takeNewModule) {
        process = resolveModulesByNew;
    } else if (options.takeFrequentModule) {
        process = resolveModulesByFrequent;
    } else {
        process = resolveModulesByPrompt;
    }
    if (options.ignoreModules) {
        process = combineFilter(ignoreModules.bind(null, options.ignoreModules), process);
    }
    if (options.ignorePackages) {
        process = combineFilter(ignoreModulePackages.bind(null, options.ignorePackages), process);
    }
    return process;
}

commander
    .version(packageInfo.version)
    .option('--dir [dir]', 'repo directory')
    .option('--print', 'print conflicts (without resolving)')
    .option('--skip-packages', 'skip packages conflicts')
    .option('--skip-modules', 'skip modules conflicts')
    .option('--resolve-packages', 'resolve packages conflicts')
    .option('--take-new-module', 'resolve module conflicts with newest version')
    .option('--take-frequent-module', 'resolve module conflicts with most frequent version')
    .option('--ignore-packages [packages]', 'ignored packages (comma separated)', arg => arg.split(','))
    .option('--ignore-modules [modules]', 'ignored modules (comma separated)', arg => arg.split(','))
    .parse(process.argv);

const pathToDir = commander.dir || process.cwd();
const processPackages = selectPackagesProcessor(commander);
const processModules = selectModulesProcessor(commander);

check(pathToDir, processPackages, processModules).then(
    () => {
        process.exit(0);
    },
    (err) => {
        console.error(err);
        process.exit(1);
    },
);
