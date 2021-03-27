# Super tiny, declarative, optimistic, async store for SvelteJS.

[![NPM version](https://img.shields.io/npm/v/svelte-asyncable.svg?style=flat)](https://www.npmjs.com/package/svelte-asyncable) [![NPM downloads](https://img.shields.io/npm/dm/svelte-asyncable.svg?style=flat)](https://www.npmjs.com/package/svelte-asyncable)

## Features

- Extends the [Svelete store contract](https://svelte.dev/docs#4_Prefix_stores_with_$_to_access_their_values) with support for asynchronous values.
- Store contains a Promise of a value.
- Lazy-initialization on-demand.
- Transparent and declarative way to describing side-effects.
- Lets you update the async data without manual resolving.
- Can derive to the other store(s).
- Immutable from the box.
- Optimistic UI pattern included.
- Result of asynchronous call cached for lifetime of last surviving subscriber.

## Install

```bash
npm i svelte-asyncable --save
```

```bash
yarn add svelte-asyncable
```

CDN: [UNPKG](https://unpkg.com/svelte-asyncable/) | [jsDelivr](https://cdn.jsdelivr.net/npm/svelte-asyncable/) (available as `window.Asyncable`)

If you are **not** using ES6, instead of importing add 

```html
<script src="/path/to/svelte-asyncable/index.js"></script>
```

just before closing body tag.

## Usage

### Store with async side-effect that works as a `getter`.

Create your async store with the `asyncable` constructor.  It takes a callback or `getter` that allows you to establish an initial value of the store.

```javascript
import { asyncable } from 'svelte-asyncable';

const user = asyncable(async () => {
  const res = await fetch('/user/me');
  return res.json();
});
```

Please note, the result of this callback is not evaluated until it is first subscribed to or otherwise requested. (lazy approach). 

There are two methods to access the stored promise, `subscribe` and `get`.  

`subscribe` is a reactive subscription familiar from the Svelte store contract:
```javascript
user.subscribe(async userStore => {
  console.log('user', await userStore); // will be printed after each side-effect
});
```

`get` returns a copy of the promise that will not update with the store:

```javascript
// a point in time copy of the promise in the store

const userStore = await user.get();
```

Please note, the subscription callback will be triggered with the actual value only after a side-effect.

If the `getter` or callback provided to `asyncable` returns `undefined`, the current value of the store is not updated. This may be useful, if we wish to only conditionally update the store.  For example, when using `svelte-pathfinder` if `$path` or `$query` are updated, we may only wish to update the posts store on when in the posts route:

```javascript
const posts = asyncable(async ($path, $query) => {
    if ($path.toString() === '/posts') {
      const res = await fetch(`/posts?page=${$query.params.page || 1}`);
      return res.json();
    }
  },
  null, 
  [ path, query ]
);
```

### Store with async side-effect that works as a `setter`.

You can also pass async `setter` callback as a second argument. This function will be is triggered on each update/set operation but not after a `getter` call and receives the new and previous value of the store:

```javascript
const user = asyncable(fetchUser, async ($newValue, $prevValue) => {
  await fetch('/user/me', {
    method: 'PUT',
    body: JSON.stringify($newValue)
  })
});
```

Every time the store is changed this `setter` or side-effect will be performed.  The store may be modified selectively with `update` or completely overwritten with `set`.

```javascript
user.update($user => {
  $user.visits++;
  return $user;
});

// or just set

user.set(user);
```

As the `setter` callback receives previous value, in addition to the new, you may compare current and previous values and make a more conscious side-effect. If `setter` fails the store will automatically rollback to the previous value.

```javascript
const user = asyncable(fetchUser, async ($newValue, $prevValue) => {
  if ($newValue.email !== $prevValue.email) {
    throw new Error('Email cannot be modified.');
  }
  await saveUser($newValue);
});
```

### Read-only asyncable store.

If you pass a falsy value (n.b. `undefined` excluded) as a second argument the asyncable store will be read-only.

```javascript
const tags = asyncable(fetchTags, null);

tags.subscribe(async $tags => {
  console.log('tags changed', await $tags); // will never triggered
});

// changes won't actually be applied
tags.update($tags => {
  $tags.push('new tag');
  return $tags;
});
```

If you pass `undefined` as a second argument to `asyncable`, the store will be writable but without `setter` side-effect. The second parameter's default value is `undefined` so it is only required in the case you need to pass a third parameter.  This will be useful in case bellow.

### Dependency to another store(s).

Also, an asyncable store may depend on another store(s). Just pass an array of such stores as a third argument to `asyncable`. These values will be available to the `getter`.  An asyncable may even depend on another asyncable store:

```javascript
const userPosts = asyncable(async $user => {
  const user = await $user;
  return fetchPostsByUser(user.id);
}, undefined, [ user ]);

userPosts.subscribe(async posts => {
  console.log('user posts', await posts);
});
```

The `getter` will be triggered with the new values of related stores each time they change.

### Using with Svelte auto-subscriptions.

```svelte
{#await $user}
  <p>Loading user...</p>
{:then user}
  <b>{user.firstName}</b>
{:catch err}
  <mark>User failed.</mark>
{/await}

<script>
  import { user } from './store.js';
</script>
```

### Simple synchronization with localStorage.

```javascript
function localStore(key, defaultValue) {
  return asyncable(
    () => JSON.parse(localStorage.getItem(key) || defaultValue), 
    val => localStorage.setItem(key, JSON.stringify(val))
  );
}


const todos = localStore('todos', []);

function addTodoItem(todo) {
  todos.update($todos => {
    $todos.push(todo);
    return $todos;
  });
}

```

### Get synchronous value from async store:

```javascript
import { syncable } from 'svelte-asyncable';

const todosSync = syncable(todos, []);
```

Now you can use sync version of asyncable store in any places you don't need to have pending/fail states.

### Caching:

The ```getter``` is only run once at first subscription to the store.  Subsequent `subscribe` or `get` calls simply share this value while at least one subscription is active.  If all subscriptions are destroyed, the ```getter``` is rerun on next subscription. 

However, if the data on which your store depends changes infrequently, you may wish for a store to persist for the lifetime of the application.  In order to achieve this you may conditionally return your initial value on the absence of an existing value.

```javascript
export const pinsStore = asyncable(async () => {
    const $pinstStore = await pinsStore.get();
    if ($pinstStore.length > 0) return;
    return getAllPins();
});
```

## License

MIT &copy; [PaulMaly](https://github.com/PaulMaly)
