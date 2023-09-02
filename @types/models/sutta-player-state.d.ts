import { LocalStorageState } from '../runtime/localstorage-state.js';
import { SuttaStorageQueryable } from './sutta-storage-queryable.js';
export declare class SuttaSelection extends LocalStorageState {
    context: string;
    collectionIndex: number;
    suttaIndex: number;
    baseRef: string;
    constructor(ctx: string);
    read(src: SuttaSelection): void;
    updateBaseRef(qry: SuttaStorageQueryable): void;
    save(): void;
    load(): void;
}
export declare class SuttaPlayerState extends LocalStorageState {
    navSel: SuttaSelection;
    textSel: SuttaSelection;
    audioSel: SuttaSelection;
    autoPlay: boolean;
    playNext: boolean;
    repeat: boolean;
    linkTextToAudio: boolean;
    currentTime: number;
    colorTheme: string;
    stopDwnlDel: number;
    save(): void;
    load(): void;
}
