export declare class DeferredPromise<T> implements Promise<T> {
    private _promise;
    private _resolve;
    private _reject;
    constructor();
    reject(reason?: any): void;
    resolve(param: T): void;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<T | TResult>;
    finally(onfinally?: () => void): Promise<T>;
    [Symbol.toStringTag]: string;
}
