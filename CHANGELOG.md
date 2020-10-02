# svelte-asyncable changelog

## 1.2.0
* Now, if `getter` return `undefined` it means that store should keep current value.

## 1.1.0
* Added `svelte` as peerDependency
* Used an optimistic UI approach and set new value instantly with rollback to previous value if `setter` failed.
* Added simple check of new and old values before value update to prevent unnecessarily triggering for primitive values.

## 1.0.7

* `reducer` should receive a shallow copy of current value.

## 1.0.6

* Previous value should be resolved before passing to `setter`

## 1.0.5

* Pass previous value as a second argument of `setter`

## 1.0.4

* Perform `setter` before store update/set

## 1.0.3

* Demo example added (REPL)

## 1.0.2

* Make store read-only if `setter` is falsy

## 1.0.1

* Few optimizations

## 1.0.0

* First release
