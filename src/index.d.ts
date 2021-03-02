import type { Writable, Readable } from 'svelte/store';
type AsyncValue<T> = Promise<T>;
type Stores = [Readable<any>, ...Array<Readable<any>>];
type StoresValues<T> = T extends Readable<infer U>
    ? U
    : {
          [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
      };
export interface Asyncable<T> extends Writable<AsyncValue<T>> {
    get: () => AsyncValue<T>;
}

export function asyncable<T>(
    getter: (...values: StoresValues<Stores>[]) => AsyncValue<T> | T,
    setter?: (newValue: T, oldValue: T) => AsyncValue<T> | T,
    stores?: Stores
): Asyncable<T>;

export function syncable<T>(stores: Stores, initialValue?: T): Readable<T>;
