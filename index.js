#!/usr/bin/env node

const check = require('monorepo-deps-checker');
const showList = require('./console-list');

function resolvePackagesVersions(conflicts) {

}

function resolveModulesVersions(conflicts) {

}

Promise.resolve()
    .then(() => {
        return showList(['Item 1\na', 'Item 2\nb', 'Item 3']);
    })
    .then((selected) => {
        console.log('Selection 1', selected);
        return showList(['Item 4', 'Item 5\nc', 'Item 6', 'Item 7']);
    })
    .then((selected) => {
        console.log('Selection 2', selected);
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
