function ignorePackages(list, conflicts) {
    const set = new Set(list);
    return conflicts.filter(conflict => !set.has(conflict.packageName));
}

function ignoreModules(list, conflicts) {
    const set = new Set(list);
    return conflicts.filter(conflict => !set.has(conflict.moduleName));
}

function ignoreModulePackages(list, conflicts) {
    const set = new Set(list);
    return conflicts.map((conflict) => {
        const items = conflict.items.map((item) => {
            const packages = item.packages.filter(obj => !set.has(obj.packageName));
            return Object.assign({}, item, { packages });
        });
        return Object.assign({}, conflict, { items });
    });
}

module.exports = {
    ignorePackages,
    ignoreModules,
    ignoreModulePackages,
};
