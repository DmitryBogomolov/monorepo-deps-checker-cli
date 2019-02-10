#!/usr/bin/env node

const check = require('monorepo-deps-checker');

function resolvePackagesVersions(conflicts) {

}

function resolveModulesVersions(conflicts) {

}

const repoDir = process.argv[2] || '.';
check(repoDir, resolvePackagesVersions, resolveModulesVersions).then(
    () => {
        console.log('DONE');
    },
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
