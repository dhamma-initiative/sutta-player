export class LocalStorageState {
    _getItemBoolean(key, defVal) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = val === '1' ? true : false;
        return ret;
    }
    _getItemNumber(key, defVal) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = Number(val);
        return ret;
    }
    _getItemString(key, defVal) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = val;
        return ret;
    }
    _getItemJson(key, defVal) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = JSON.parse(val);
        return ret;
    }
    _setItemBoolean(key, val) {
        localStorage.setItem(key, val ? '1' : '0');
    }
    _setItemNumber(key, val) {
        localStorage.setItem(key, String(val));
    }
    _setItemString(key, val) {
        if (val !== null)
            localStorage.setItem(key, val);
    }
    _setItemJson(key, val) {
        if (val !== null) {
            const jsonAsStr = JSON.stringify(val);
            localStorage.setItem(key, jsonAsStr);
        }
    }
}
//# sourceMappingURL=localstorage-state.js.map