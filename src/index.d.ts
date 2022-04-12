import type { Readable } from 'svelte/store';
export type AsyncValue<T> = Promise<T>;
export type Updater<T> = (value: T) => AsyncValue<T> | T;
export type Stores = Readable<T> | [Readable<T>, ...Array<Readable<T>>];
export type StoresValues<T> = T extends Readable<infer U> ? U : never;


export interface Asyncable<T> extends Readable<AsyncValue<T>> {
    get: () => AsyncValue<T>;
    set: (value: T) => void;
    update: (updater: Updater<T>) => void;
}

export declare function asyncable<T>(
    getter: () => AsyncValue<T> | T,
    setter?: ((newValue: T, oldValue: T) => AsyncValue<T> | T) | unknown,
): Asyncable<T>;



export declare function asyncable<T, S extends Stores>(
    getter: (...values: StoresValues<S>[]) => AsyncValue<T> | T,
    setter: ((newValue: T, oldValue: T) => AsyncValue<T> | T) | unknown,
    stores: S
): Asyncable<T>;

export declare function syncable<T>(
    stores: Stores,
    initialValue?: T
): Readable<T>;
