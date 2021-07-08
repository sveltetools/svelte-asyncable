import type { Writable, Readable } from 'svelte/store';
export type AsyncValue<T> = Promise<T>;
export type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];
export type StoresValues<T> = T extends Readable<infer U> ? U : never;
export interface Asyncable<T> extends Writable<AsyncValue<T>> {
    get: () => AsyncValue<T>;
}

export function asyncable<S extends Stores, T>(
    getter: (...values: StoresValues<S>[]) => AsyncValue<T> | T,
    setter?: (newValue: T, oldValue: T) => AsyncValue<T> | T,
    stores?: S
): Asyncable<T>;

export function syncable<T>(stores: Stores, initialValue?: T): Readable<T>;
