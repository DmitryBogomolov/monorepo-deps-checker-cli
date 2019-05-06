const {
    ignorePackages,
    ignoreModules,
    ignoreModulePackages,
} = require('./filters');

describe('filters', () => {
    describe('ignorePackages', () => {
        it('remove items', () => {
            const result = ignorePackages(['b', 'c'], [
                { packageName: 'a' },
                { packageName: 'b' },
                { packageName: 'b' },
                { packageName: 'c' },
                { packageName: 'd' },
            ]);

            expect(result).toEqual([
                { packageName: 'a' },
                { packageName: 'd' },
            ]);
        });
    });

    describe('ignoreModules', () => {
        it('remove items', () => {
            const result = ignoreModules(['b', 'c'], [
                { moduleName: 'a' },
                { moduleName: 'b' },
                { moduleName: 'b' },
                { moduleName: 'c' },
                { moduleName: 'd' },
            ]);

            expect(result).toEqual([
                { moduleName: 'a' },
                { moduleName: 'd' },
            ]);
        });
    });

    describe('ignoreModulePackages', () => {
        it('remove items', () => {
            const result = ignoreModulePackages(['b', 'c'], [
                {
                    moduleName: '1',
                    items: [
                        { packages: [{ packageName: 'a' }] },
                        { packages: [{ packageName: 'b' }, { packageName: 'd' }] },
                    ],
                },
                {
                    moduleName: '2',
                    items: [
                        { packages: [{ packageName: 'b' }] },
                        { packages: [{ packageName: 'c' }, { packageName: 'd' }] },
                        { packages: [{ packageName: 'a' }, { packageName: 'd' }] },
                    ],
                },
            ]);

            expect(result).toEqual([
                {
                    moduleName: '1',
                    items: [
                        { packages: [{ packageName: 'a' }] },
                        { packages: [{ packageName: 'd' }] },
                    ],
                },
                {
                    moduleName: '2',
                    items: [
                        { packages: [] },
                        { packages: [{ packageName: 'd' }] },
                        { packages: [{ packageName: 'a' }, { packageName: 'd' }] },
                    ],
                },
            ]);
        });
    });
});
