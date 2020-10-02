# Async store for Svelte 3 which is stored value as the Promise.

[![NPM version](https://img.shields.io/npm/v/svelte-asyncable.svg?style=flat)](https://www.npmjs.com/package/svelte-asyncable) [![NPM downloads](https://img.shields.io/npm/dm/svelte-asyncable.svg?style=flat)](https://www.npmjs.com/package/svelte-asyncable)

## Features

- Stores the value as the Promise.

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

This callback allows you to establish an initial value of the store.

```javascript
import asyncable from 'svelte-asyncable';

const user$ = asyncable(async () => {
  const res = await fetch('/user/me');
  return res.json();
});
```

Important, that `getter` won't be triggered before the first subscription (lazy approach). 

If you need to have reactive subscription use `subscribe` method or just get current value (always the Promise) using `get` method:

```javascript
user$.subscribe(async user => {
  console.log('user', await user); // will be printed only after side-effect
});

// or once subscription

const user = await user$.get();
```

Important, subscription callback will be triggered with actual value only after side-effect completely performed.

If `getter` return `undefined` current value would keeped. It's useful, if we need to skip next value when one of dependencies is triggering, but actual store value shouldn't be changed. For example, integration with `svelte-pathfinder`:

```javascript
const posts = asyncable(async ($path, $query) => {
    if ($path.toString() === '/posts') {
      const res = await fetch(`/posts?page=${$query.page || 1}`);
      return res.json();
    }
  },
  null, 
  [ path, query ]
);
```


### Store with async side-effect that works as a `setter`.

You can also pass async `setter` callback as a second argument. This function will be triggered with new and previous value on each update/set operation but not after `getter` call:

```javascript
const user$ = asyncable(fetchUser, async (newValue, prevValue) => {
  await fetch('/user/me', {
    method: 'PUT',
    body: JSON.stringify(newValue)
  })
});
```

Every time store has changed side-effect will be performed.

```javascript
user$.update(user => {
  user.visits++;
  return user;
});

// or just set

user$.set(user);
```

`setter` callback us also receives previous value to get the ability to compare current and previous values and make a more conscious side-effect. If `setter` failы store will automatically rollback value to the previous one.

```javascript
const user$ = asyncable(fetchUser, async (newValue, prevValue) => {
  if (newValue.email !== prevValue.email) {
    throw new Error('Email cannot be modified.');
  }
  await saveUser(newValue);
});
```

### Read-only asyncable store.

If you'll pass the obvious falsy value (except `undefined`) as a second argument it'll make asyncable store is read-only.

```javascript
const tags$ = asyncable(fetchTags, null);

tags$.subscribe(async tags => {
  console.log('tags changed', await tags); // will never triggered
});

// changes won't actually be applied
tags$.update(tags => {
  tags.push('new tag');
  return tags;
});
```

If you'll pass `undefined` as a second argument store will be writable but without `setter` side-effect. It can be useful in case bellow.

### Dependency to another store(s).

Also, an asyncable store may depend on another store(s). Just pass an array of such stores as a third argument. Related values will be passed as arguments of `getter`. For example dependence one asyncable store from another:

```javascript
const userPosts$ = asyncable(async user => {
  user = await user;
  return fetchPostsByUser(user.id);
}, undefined, [ user$ ]);

userPosts$.subscribe(async posts => {
  console.log('user posts', await posts);
});
```

`getter` will be triggered with the new values of related stores each time they changed.

### Using with Svelte auto-subscriptions.

```html
{#await $user$}
  <p>Loading user...</p>
{:then user}
  <b>{user.firstName}</b>
{:catch err}
  <mark>User failed.</mark>
{/await}

<script>
  import { user$ } from './store.js';
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


const todos$ = localStore('todos', []);

function addTodoItem(todo) {
  todos$.update(todos => {
    todos.push(todo);
    return todos;
  });
}

```

## License

MIT &copy; [PaulMaly](https://github.com/PaulMaly)
