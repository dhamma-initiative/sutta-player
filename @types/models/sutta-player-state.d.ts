import { LocalStorageState } from '../runtime/localstorage-state.js';
import { SuttaStorageQueryable } from './sutta-storage-queryable.js';
export declare class TrackSelection extends LocalStorageState {
    context: string;
    albumIndex: number;
    trackIndex: number;
    baseRef: string;
    constructor(ctx: string, albIdx?: number, trkIdx?: number, bRef?: string);
    read(src: TrackSelection): void;
    updateBaseRef(qry: SuttaStorageQueryable): void;
    save(): void;
    load(): void;
}
export declare class SuttaPlayerState extends LocalStorageState {
    navSel: TrackSelection;
    textSel: TrackSelection;
    audioSel: TrackSelection;
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
