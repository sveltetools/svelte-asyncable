# svelte-asyncable ([demo](https://svelte.dev/repl/3f070579c1cb4892972e23055701b988?version=3.12.1))

Asyncable store for [Svelte 3](https://svelte.dev/) which is store a value as promise.

## Usage

Install with npm or yarn:

```bash
npm install --save svelte-asyncable
```

Create asyncable store with async handler (side-effect):

```javascript

import asyncable from 'svelte-asyncable';

const user$ = asyncable(fetchUser);
```

# Async `getter` hook won't be triggered before first subscription. If you need to have reactive subscription use `subscribe` method or just get a promise to current value in place:

```javascript
user$.subscribe(async user => {
  console.log('user', await user); // will be printed only after side-effect
});

// or once subscription

const user = await user$.get();

```

# You can also pass async `setter` hook as second argument which will be triggered on each update/set operation but not after `getter` call:

```javascript
const user$ = asyncable(fetchUser, saveUser);

const user = await user$.get(); // `getter` will be triggered, `setter` is not

user$.update(user => {
  user.visits++;
  return user;
}); // value has changed - `setter` will be triggered
```

User data will be automatically fetched on first subscription and all subsequent changes will be automatically saved.

# Also asyncable store may depend on another store(s), for example:

```javascript
const userPosts$ = asyncable(async user => { // get related stores values as arguments of `getter` hook
  user = await user;
  return fetchPostsByUser(user.id);
}, undefined, [ user$ ]); // pass related stores as a third argument

userPosts$.subscribe(async posts => {
  console.log('user posts', await posts);
});

```

## License

MIT
