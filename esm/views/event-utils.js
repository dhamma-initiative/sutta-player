export class LongPressManager {
    _delayMap = new Map();
    setListener(elem, cb, dur = 1500) {
        elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const handle = setTimeout((e) => {
                cb(e);
            }, dur);
            this._delayMap.set(elem, handle);
        }, true);
        const mouseOther = (e) => {
            this._clearTimeout(elem);
        };
        elem.addEventListener('mouseup', mouseOther);
        elem.addEventListener('mouseout', mouseOther);
    }
    deleteListener(elem) {
        this._clearTimeout(elem);
        this._delayMap.delete(elem);
    }
    _clearTimeout(elem) {
        const handle = this._delayMap.get(elem);
        if (handle)
            clearTimeout(handle);
    }
}
//# sourceMappingURL=event-utils.js.map