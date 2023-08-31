export class DeferredPromise<T> implements Promise<T> {
	private _promise: Promise<T>
	private _resolve!: (value: T | PromiseLike<T>) => void
	private _reject!: (reason?: any) => void

	public constructor() {
		this._promise = new Promise<T>((resolve, reject) => {
			this._resolve = resolve
			this._reject = reject
		})
	}

	public reject(reason?: any): void {
		this._reject(reason)
	}

	public resolve(param: T): void {
		this._resolve(param)
	}

	public then<TResult1 = T, TResult2 = never>(
		onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
		onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
	): Promise<TResult1 | TResult2> {
		return this._promise.then(onfulfilled, onrejected)
	}

	public catch<TResult = never>(
		onrejected?: (reason: any) => TResult | PromiseLike<TResult>
	): Promise<T | TResult> {
		return this._promise.catch(onrejected)
	}

	public finally(onfinally?: () => void): Promise<T> {
		return this._promise.finally(onfinally)
	}
	[Symbol.toStringTag]: string
}