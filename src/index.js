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
			store$.update(async value => {
				const val = reducer(await value);
				setter(await val);
				return val;
			});		
		},
		async set(value) {
			store$.set(Promise.resolve(value));
			setter(await value);
		},
		async get() {
			return await get(store$);
		}
	};
}