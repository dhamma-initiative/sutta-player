export declare class LocalStorageState {
    protected _getItemBoolean(key: string, defVal: boolean): boolean;
    protected _getItemNumber(key: string, defVal: number): number;
    protected _getItemString(key: string, defVal: string): string;
    protected _getItemJson(key: string, defVal: any): any;
    protected _setItemBoolean(key: string, val: boolean): void;
    protected _setItemNumber(key: string, val: number): void;
    protected _setItemString(key: string, val: string): void;
    protected _setItemJson(key: string, val: any): void;
}
