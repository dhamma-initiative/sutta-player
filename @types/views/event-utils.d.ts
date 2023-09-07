export type LongPressListener = (event: Event) => void;
export declare class LongPressManager {
    private _delayMap;
    setListener(elem: HTMLElement, cb: LongPressListener, dur?: number): void;
    deleteListener(elem: HTMLElement): void;
    private _clearTimeout;
}
