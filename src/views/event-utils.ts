export type LongPressListener = (event: Event) => void

export class LongPressManager {
    private _delayMap = new Map<HTMLElement, number>()

    public setListener(elem: HTMLElement, cb: LongPressListener, dur = 1500) {
        elem.addEventListener('mousedown', (e: Event) => {
            e.preventDefault()
            const handle = setTimeout((e: Event) => {
                cb(e)
            }, dur)
            this._delayMap.set(elem, handle)
        }, true)

        const mouseOther = (e: Event) => {
            this._clearTimeout(elem)
        }

        elem.addEventListener('mouseup', mouseOther)
        elem.addEventListener('mouseout', mouseOther)
    }

    public deleteListener(elem: HTMLElement) {
        this._clearTimeout(elem)
        this._delayMap.delete(elem)
    }

    private _clearTimeout(elem: HTMLElement) {
        const handle = this._delayMap.get(elem)
        if (handle)
            clearTimeout(handle)
    }
}