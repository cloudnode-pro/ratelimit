# Rate limiting utility
![version: 1.2.0](https://img.shields.io/badge/version-1.2.0-%233b82f6)
![test: passing](https://img.shields.io/badge/tests-passing-%2316a34a)
![coverage: 100%](https://img.shields.io/badge/coverage-100%25-%2316a34a)
![build: passing](https://img.shields.io/badge/build-passing-%2316a34a)

A relatively simple utility for abstract rate limiting. This library uses memory storage (i.e. does not rely on external database or writing data on your file system). Rate limits are reset if the process is restarted.

# Get started
#### Install package from `npm`
```sh
npm i cldn-ratelimit
```
#### Import in your project
Here is a very simple demo demonstrating very basic limiting of login attempts.
```js
import {RateLimit} from 'cldn-ratelimit';

const rateLimit = new RateLimit("login-attempts", 3, 60); // max 3 requests per 60 seconds

const attemptLogin = (username, password) => {
	if (!rateLimit.attempt(username).allow) return "rate-limited";
	if (username === "john.doe" && password === "password123") return "success";
	return "wrong-password";
}

attemptLogin("john.doe", "wrongpass"); //-> "wrong-password"
attemptLogin("john.doe", "wrongpass2"); //-> "wrong-password"
attemptLogin("john.doe", "wrongpass"); //-> "wrong-password"
attemptLogin("john.doe", "password123"); //-> "rate-limited"
// wait 60 seconds
attemptLogin("john.doe", "password123"); //-> "success"
```

If you want to reset the rate limit after a successful login, call [`rateLimit.reset(username)`](#ratelimitresetsource).

# Documentation
<details open>
	<summary>Table of contents</summary>

- [Class: `RateLimit`](#class-ratelimit)
	- [Static method: `RateLimit.attempt(name, source, [attempts], [callback])`](#static-method-ratelimitattemptname-source-attempts-callback)
	- [Static method: `RateLimit.check(name, source, [callback])`](#static-method-ratelimitcheckname-source-callback)
	- [Static method: `RateLimit.clear(name)`](#static-method-ratelimitclearname)
	- [Static method: `RateLimit.create(name, limit, timeWindow)`](#static-method-ratelimitcreatename-limit-timewindow)
	- [Static method: `RateLimit.delete(name)`](#static-method-ratelimitdeletename)
	- [Static method: `RateLimit.get(name)`](#static-method-ratelimitgetname)
	- [Static method: `RateLimit.reset(name, source)`](#static-method-ratelimitresetname-source)
	- [Static method: `RateLimit.setRemaining(name, source, remaining)`](#static-method-ratelimitsetremainingname-source-remaining)
	- [`new RateLimit(name, limit, timeWindow)`](#new-ratelimitname-limit-timewindow)
	- [`rateLimit.attempt(source, [attempts], [callback])`](#ratelimitattemptsource-attempts-callback)
	- [`rateLimit.check(source, [callback])`](#ratelimitchecksource-callback)
	- [`rateLimit.clear()`](#ratelimitclear)
	- [`rateLimit.delete()`](#ratelimitdelete)
	- [`rateLimit.limit`](#ratelimitlimit)
	- [`rateLimit.name`](#ratelimitname)
	- [`rateLimit.reset(source)`](#ratelimitresetsource)
	- [`rateLimit.setRemaining(source, remaining)`](#ratelimitsetremainingsource-remaining)
	- [`rateLimit.timeWindow`](#ratelimittimewindow)
- [Interface: `AttemptResult`](#interface-attemptresult)
    - [`attemptResult.limit`](#attemptresultlimit)
    - [`attemptResult.remaining`](#attemptresultremaining)
    - [`attemptResult.reset`](#attemptresultreset)
    - [`attemptResult.rateLimit`](#attemptresultratelimit)
    - [`attemptResult.allow`](#attemptresultallow)
</details>

<a name="class-ratelimit"></a>
## Class: `RateLimit`
Rate limit

<a name="static-method-ratelimitattemptname-source-attempts-callback"></a>
### Static method: `RateLimit.attempt(name, source, [attempts], [callback])`
Make an attempt with a source ID

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `attempts` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts to make. Default: `1`
- `callback` [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) Callback function. Default: `undefined`
  - `result` [`AttemptResult`](#interface-attemptresult) The result of the attempt
  - Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Returns: [`AttemptResult`](#interface-attemptresult)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitcheckname-source-callbac"></a>
### Static method: `RateLimit.check(name, source, [callback])`
Check the attempt state for a source ID without decrementing the remaining attempts

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `callback` [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) Callback function. Default: `undefined`
  - `result` [`AttemptResult`](#interface-attemptresult) The result of the attempt
  - Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Returns: [`AttemptResult`](#interface-attemptresult)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitclearname"></a>
### Static method: `RateLimit.clear(name)`
Clear rate limit attempts storage. This is equivalent to resetting all rate limits.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitcreatename-limit-timewindow"></a>
### Static method: `RateLimit.create(name, limit, timeWindow)`
Create a new rate limit

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `limit` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts allowed per time window (e.g. 60)
- `timeWindow` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The time window in seconds (e.g. 60)
- Returns: [`RateLimit`](#class-ratelimit)

<a name="static-method-ratelimitdeletename"></a>
### Static method: `RateLimit.delete(name)`
Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitgetname"></a>
### Static method: `RateLimit.get(name)`
Get a rate limit instance

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- Returns: [`RateLimit`](#class-ratelimit) or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type)

<a name="static-method-ratelimitresetsource"></a>
### Static method: `RateLimit.reset(name, source)`
Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitsetremainingname-source-remaining"></a>
### Static method: `RateLimit.setRemaining(name, source, remaining)`
Set the remaining attempts for a source ID.

> **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `remaining` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of remaining attempts
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="new-ratelimitname-limit-timewindow"></a>
### `new RateLimit(name, limit, timeWindow)`
Create a new rate limit

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `limit` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts allowed per time window (e.g. 60)
- `timeWindow` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The time window in seconds (e.g. 60)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit already exists

<a name="ratelimitattemptsource-attempts-callback"></a>
### `rateLimit.attempt(source, [attempts], [callback])`
Make an attempt with a source ID

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `attempts` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts to make. Default: `1`
- `callback` [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) Callback function
  - `result` [`AttemptResult`](#interface-attemptresult) The result of the attempt
  - Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Returns: [`AttemptResult`](#interface-attemptresult)

<a name="ratelimitchecksource-callback"></a>
### `rateLimit.check(source, [callback])`
Check the attempt state for a source ID without decrementing the remaining attempts

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `callback` [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) Callback function
  - `result` [`AttemptResult`](#interface-attemptresult) The result of the attempt
  - Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Returns: [`AttemptResult`](#interface-attemptresult)

<a name="ratelimitclear"></a>
### `rateLimit.clear()`
Clear rate limit attempts storage. This is equivalent to resetting all rate limits.

- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitdelete"></a>
### `rateLimit.delete()`
Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.

- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitlimit"></a>
### `rateLimit.limit`
The number of requests allowed per time window

- Type: [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)

<a name="ratelimitname"></a>
### `rateLimit.name`
Get rate limit name

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
- Readonly

<a name="ratelimitresetsource"></a>
### `rateLimit.reset(source)`
Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitsetremainingsource-remaining"></a>
### `rateLimit.setRemaining(source, remaining)`
Set the remaining attempts for a source ID.

> **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `remaining` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of remaining attempts
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimittimewindow"></a>
### `rateLimit.timeWindow`
The time window in seconds (e.g. 60)

- Type: [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)

<a name="interface-attemptresult"></a>
## Interface: `AttemptResult`
The result from a rate limit attempt

<a name="attemptresultlimit"></a>
### `attemptResult.limit`
The number of requests this rate limit allows per time window

- Type: [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)
- Readonly

<a name="attemptresultremaining"></a>
### `attemptResult.remaining`
The number of requests remaining in the current time window

- Type: [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)
- Readonly

<a name="attemptresultreset"></a>
### `attemptResult.reset`
The number of seconds until the current time window resets

- Type: [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)
- Readonly

<a name="attemptresultratelimit"></a>
### `attemptResult.rateLimit`
The rate limit that this attempt was made on

- Type: [`RateLimit`](#class-ratelimit)
- Readonly

<a name="attemptresultallow"></a>
### `attemptResult.allow`
Whether this attempt should be allowed to proceed. If false, the attempt is rate limited.

- Type: [`boolean`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
- Readonly
