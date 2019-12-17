import { writable, derived, get } from 'svelte/store';

export default function (getter, setter = () => {}, stores = []) {

	let resolve;
	const initial = new Promise(res => resolve = res);

	const derived$ = derived(stores, values => values);

	const store$ = writable(initial, set => {
		return derived$.subscribe(async (values = []) => {
			const value = Promise.resolve(getter(...values));
			set(value);
			resolve(value);
		});
	});

	return {
		subscribe: store$.subscribe,
		async update(reducer) {
			if ( ! setter) return;
			store$.update(async value => {
				value = await value;
				const val = await reducer(shallowCopy(value));
				await setter(val, value);
				return val;
			});
		},
		async set(value) {
			if ( ! setter) return;
			value = await value;
			await setter(value);
			store$.set(Promise.resolve(value));
		},
		get() {
			return get(store$);
		}
	};
}

function shallowCopy(value) {
	if (typeof value !== 'object' || value === null) return value;
	return Array.isArray(value) ? [ ...value ] : { ...value };
}