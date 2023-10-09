export class LocalStorageState {
    protected _getItemBoolean(key: string, defVal: boolean) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = val === '1' ? true : false;
        return ret;
    }

    protected _getItemNumber(key: string, defVal: number) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = Number(val);
        return ret;
    }

    protected _getItemString(key: string, defVal: string) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val)
            ret = val;
        return ret;
    }

    protected _getItemJson(key: string, defVal: any) {
        let ret = defVal;
        const val = localStorage.getItem(key);
        if (val) 
            ret = JSON.parse(val)
        return ret
    }

    protected _setItemBoolean(key: string, val: boolean) {
        localStorage.setItem(key, val ? '1' : '0');
    }

    protected _setItemNumber(key: string, val: number) {
        localStorage.setItem(key, String(val));
    }

    protected _setItemString(key: string, val: string) {
        if (val !== null)
            localStorage.setItem(key, val);
    }

    protected _setItemJson(key: string, val: any) {
        if (val !== null) {
            const jsonAsStr = JSON.stringify(val)
            localStorage.setItem(key, jsonAsStr);
        }
    }
}