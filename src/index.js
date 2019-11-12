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
				const val = await reducer(await value);
				await setter(val);
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
