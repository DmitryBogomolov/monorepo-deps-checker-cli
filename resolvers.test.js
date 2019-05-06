const {
    resolveAllPackages,
    resolveModulesByFrequent,
    resolveModulesByNew,
} = require('./resolvers');

describe('resolvers', () => {
    describe('resolveAllPackages', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mock3 = jest.fn();
            resolveAllPackages([
                { resolve: mock1 },
                { resolve: mock2 },
                { resolve: mock3 },
            ]);

            expect(mock1).toBeCalledWith();
            expect(mock2).toBeCalledWith();
            expect(mock3).toBeCalledWith();
        });
    });

    describe('resolveModulesByFrequent', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mock3 = jest.fn();
            resolveModulesByFrequent([
                { resolve: mock1 },
                { resolve: mock2 },
                { resolve: mock3 },
            ]);

            expect(mock1).toBeCalledWith(0);
            expect(mock2).toBeCalledWith(0);
            expect(mock3).toBeCalledWith(0);
        });
    });

    describe('resolveModulesByNew', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            resolveModulesByNew([
                {
                    resolve: mock1,
                    items: [
                        { version: '1.2' },
                        { version: '1.3.1' },
                        { version: '1.3' },
                    ],
                },
                {
                    resolve: mock2,
                    items: [
                        { version: '3' },
                        { version: '2.1.1' },
                    ],
                },
            ]);

            expect(mock1).toBeCalledWith(1);
            expect(mock2).toBeCalledWith(0);
        });
    });
});
