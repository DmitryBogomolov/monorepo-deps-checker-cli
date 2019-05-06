const printList = jest.fn();
jest.mock('cli-list-select', () => printList);

const {
    showPackages,
    resolveAllPackages,
    resolvePackagesByPrompt,
    showModules,
    resolveModulesByFrequent,
    resolveModulesByNew,
    resolveModulesByPrompt,
} = require('./resolvers');

describe('resolvers', () => {
    beforeAll(() => {
        console.log = () => {}; // eslint-disable-line no-console
    });

    describe('showPackages', () => {
        it('print', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const promise = showPackages([
                { resolve: mock1 },
                { resolve: mock2 },
            ]);

            return promise.then(() => {
                expect(mock1).not.toBeCalled();
                expect(mock2).not.toBeCalled();
            });
        });
    });

    describe('resolveAllPackages', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mock3 = jest.fn();
            const promise = resolveAllPackages([
                { resolve: mock1 },
                { resolve: mock2 },
                { resolve: mock3 },
            ]);

            return promise.then(() => {
                expect(mock1).toBeCalledWith();
                expect(mock2).toBeCalledWith();
                expect(mock3).toBeCalledWith();
            });
        });
    });

    describe('resolvePackagesByPrompt', () => {
        afterEach(() => {
            printList.mockReset();
        });

        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mock3 = jest.fn();
            const conflicts = [
                { resolve: mock1 },
                { resolve: mock2 },
                { resolve: mock3 },
            ];
            printList.mockResolvedValueOnce({ checks: [0, 2] });
            const promise = resolvePackagesByPrompt(conflicts);

            return promise.then(() => {
                expect(printList).toBeCalledWith(conflicts, { printItem: expect.any(Function) });

                expect(mock1).toBeCalledWith();
                expect(mock2).not.toBeCalled();
                expect(mock3).toBeCalledWith();
            });
        });
    });

    describe('showModules', () => {
        it('print', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const promise = showModules([
                { resolve: mock1, items: [] },
                { resolve: mock2, items: [] },
            ]);

            return promise.then(() => {
                expect(mock1).not.toBeCalled();
                expect(mock2).not.toBeCalled();
            });
        });
    });

    describe('resolveModulesByFrequent', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mock3 = jest.fn();
            const promise = resolveModulesByFrequent([
                {
                    resolve: mock1,
                    items: [{}],
                },
                {
                    resolve: mock2,
                    items: [{}],
                },
                {
                    resolve: mock3,
                    items: [{}],
                },
            ]);

            return promise.then(() => {
                expect(mock1).toBeCalledWith(0);
                expect(mock2).toBeCalledWith(0);
                expect(mock3).toBeCalledWith(0);
            });
        });
    });

    describe('resolveModulesByNew', () => {
        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const promise = resolveModulesByNew([
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

            return promise.then(() => {
                expect(mock1).toBeCalledWith(1);
                expect(mock2).toBeCalledWith(0);
            });
        });
    });

    describe('resolveModulesByPrompt', () => {
        afterEach(() => {
            printList.mockReset();
        });

        it('resolve', () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const conflicts = [
                {
                    resolve: mock1,
                    items: [
                        { packages: [] },
                    ],
                },
                {
                    resolve: mock2,
                    items: [
                        { packages: [] },
                        { packages: [] },
                    ],
                },
            ];
            printList.mockResolvedValueOnce({ note: true, index: 1 });
            printList.mockResolvedValueOnce({ checks: 0 });
            printList.mockResolvedValueOnce({});
            const promise = resolveModulesByPrompt(conflicts);

            return promise.then(() => {
                const anyFunction = expect.any(Function);
                expect(printList.mock.calls).toEqual([
                    [conflicts, {
                        index: -1,
                        checks: [],
                        printItem: anyFunction,
                        handlers: { space: anyFunction },
                    }],
                    [conflicts[1].items, {
                        singleCheck: true,
                        printItem: anyFunction,
                        handlers: { backspace: anyFunction },
                    }],
                    [conflicts, {
                        index: 1,
                        checks: [1],
                        printItem: anyFunction,
                        handlers: { space: anyFunction },
                    }],
                ]);

                expect(mock1).not.toBeCalled();
                expect(mock2).toBeCalledWith(0);
            });
        });
    });
});
