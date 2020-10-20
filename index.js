(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('svelte/store')) :
	typeof define === 'function' && define.amd ? define(['svelte/store'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.asyncable = factory(global.store));
}(this, (function (store) { 'use strict';

	function index (getter, setter = () => { }, stores = []) {

		let resolve;
		const initial = new Promise(res => resolve = res);

		const derived$ = store.derived(stores, values => values);

		const store$ = store.writable(initial, set => {
			return derived$.subscribe(async (values = []) => {
				let value = await getter(...values);
				if (value === undefined) return;
				value = Promise.resolve(value);
				set(value);
				resolve(value);
			});
		});

		async function set(newValue, oldValue) {
			if (newValue === oldValue) return;
			store$.set(Promise.resolve(newValue));
			try {
				await setter(newValue, oldValue);
			} catch (err) {
				store$.set(Promise.resolve(oldValue));
				throw err;
			}
		}

		return {
			subscribe: store$.subscribe,
			async update(reducer) {
				if (!setter) return;
				const oldValue = await store.get(store$);
				const newValue = await reducer(shallowCopy(oldValue));
				await set(newValue, oldValue);
			},
			async set(newValue) {
				if (!setter) return;
				const oldValue = await store.get(store$);
				newValue = await newValue;
				await set(newValue, oldValue);
			},
			get() {
				return store.get(store$);
			}
		};
	}

	function shallowCopy(value) {
		if (typeof value !== 'object' || value === null) return value;
		return Array.isArray(value) ? [...value] : { ...value };
	}

	return index;

})));
