# Rate limiting utility
![version: 1.1.1](https://img.shields.io/badge/version-1.1.1-%233b82f6)
![test: passing](https://img.shields.io/badge/tests-passing-%2316a34a)
![coverage: 84%](https://img.shields.io/badge/coverage-84%25-%23ca8a04)
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
	- [Static method: `RateLimit.create(name, limit, timeWindow, [settings])`](#static-method-ratelimitcreatename-limit-timewindow-settings)
	- [Static method: `RateLimit.delete(name)`](#static-method-ratelimitdeletename)
	- [Static method: `RateLimit.get(name)`](#static-method-ratelimitgetname)
    - [Static method: `RateLimit.middleware(name, source)`](#static-method-ratelimitmiddlewarename-source)
	- [Static method: `RateLimit.request(name, source, req, res)`](#static-method-ratelimitrequestname-source-req-res)
	- [Static method: `RateLimit.reset(name, source)`](#static-method-ratelimitresetname-source)
    - [Static method: `RateLimit.response(name, attempt, req, res, [next])`](#static-method-ratelimitresponsename-attempt-req-res-next)
	- [Static method: `RateLimit.setRemaining(name, source, remaining)`](#static-method-ratelimitsetremainingname-source-remaining)
    - [Static property: `RateLimit.settings`](#static-property-ratelimitsettings)
	- [`new RateLimit(name, limit, timeWindow, [settings])`](#new-ratelimitname-limit-timewindow-settings)
	- [`rateLimit.attempt(source, [attempts], [callback])`](#ratelimitattemptsource-attempts-callback)
	- [`rateLimit.check(source, [callback])`](#ratelimitchecksource-callback)
	- [`rateLimit.clear()`](#ratelimitclear)
	- [`rateLimit.delete()`](#ratelimitdelete)
	- [`rateLimit.limit`](#ratelimitlimit)
    - [`rateLimit.middleware(source)`](#ratelimitmiddlewaresource)
	- [`rateLimit.name`](#ratelimitname)
    - [`rateLimit.request(source, req, res)`](#ratelimitrequestsource-req-res)
	- [`rateLimit.reset(source)`](#ratelimitresetsource)
    - [`rateLimit.response(attempt, req, res, [next])`](#ratelimitresponseattempt-req-res-next)
	- [`rateLimit.setRemaining(source, remaining)`](#ratelimitsetremainingsource-remaining)
    - [`rateLimit.settings`](#ratelimitsettings)
	- [`rateLimit.timeWindow`](#ratelimittimewindow)
- [Interface: `AttemptResult`](#interface-attemptresult)
    - [`attemptResult.limit`](#attemptresultlimit)
    - [`attemptResult.remaining`](#attemptresultremaining)
    - [`attemptResult.reset`](#attemptresultreset)
    - [`attemptResult.rateLimit`](#attemptresultratelimit)
    - [`attemptResult.allow`](#attemptresultallow)
- [Interface: `RateLimitSettings`](#interface-ratelimitsettings)
    - [`rateLimitSettings.sendHeaders`](#ratelimitsettingssendheaders)
    - [`rateLimitSettings.headers`](#ratelimitsettingsheaders)
      - [`rateLimitSettings.headers.limit`](#ratelimitsettingsheaderslimit)
      - [`rateLimitSettings.headers.remaining`](#ratelimitsettingsheadersremaining)
      - [`rateLimitSettings.headers.reset`](#ratelimitsettingsheadersreset)
      - [`rateLimitSettings.headers.policy`](#ratelimitsettingsheaderspolicy)
    - [`rateLimitSettings.resetHeaderValue(reset)`](#ratelimitsettingsresetheadervaluereset)
    - [`rateLimitSettings.defaultResponse(attempt, req, res, [next])`](#ratelimitsettingsdefaultresponseattempt-req-res-next)
- [Namespace: `RateLimit`](#namespace-ratelimit)
  - [Type: `RateLimit.SourceFromReq`](#type-ratelimitsourcefromreq) 
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

<a name="static-method-ratelimitcreatename-limit-timewindow-settings"></a>

### Static method: `RateLimit.create(name, limit, timeWindow, [settings])`
Create a new rate limit

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `limit` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts allowed per time window (e.g. 60)
- `timeWindow` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The time window in seconds (e.g. 60)
- `settings` [`RateLimitSettings`](#interface-ratelimitsettings) or [`Record<string, any>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) Settings for this rate limit
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

<a name="static-method-ratelimitmiddlewarename-source"></a>

### Static method: `RateLimit.middleware(name, source)`
Express.js middleware to make a rate limit attempt and also send rate limit headers.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`RateLimit.SourceFromReq`](#type-ratelimitsourcefromreq) Function to get the source ID from the request
- Returns: [`e.RequestHandler`](https://expressjs.com/en/guide/using-middleware.html)

<a name="static-method-ratelimitrequestname-source-req-res"></a>

### Static method: `RateLimit.request(name, source, req, res)`
Make a rate limit attempt and also send rate limit headers.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `req` [`e.Request`](https://expressjs.com/en/api.html#req) Express.js request object
- `res` [`e.Response`](https://expressjs.com/en/api.html#res) Express.js response object
- Returns: [`AttemptResult`](#interface-attemptresult)

<a name="static-method-ratelimitresetsource"></a>

### Static method: `RateLimit.reset(name, source)`
Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-method-ratelimitresponsename-attempt-req-res-next"></a>

### Static method: `RateLimit.response(name, attempt, req, res, [next])`
Send rate limit response that is set in the settings.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `attempt` [`AttemptResult`](#interface-attemptresult) The attempt result
- `req` [`e.Request`](https://expressjs.com/en/api.html#req) Express.js request object
- `res` [`e.Response`](https://expressjs.com/en/api.html#res) Express.js response object
- `next` [`e.NextFunction`](https://expressjs.com/en/guide/using-middleware.html) Call next middleware

<a name="static-method-ratelimitsetremainingname-source-remaining"></a>

### Static method: `RateLimit.setRemaining(name, source, remaining)`
Set the remaining attempts for a source ID.

> **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `remaining` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of remaining attempts
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)
- Throws: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) If the rate limit does not exist

<a name="static-property-ratelimitsettings"></a>

### Static property: `RateLimit.settings`
Global rate limit settings. These will apply to all rate limits.

- Type: [`RateLimitSettings`](#interface-ratelimitsettings)

<a name="new-ratelimitname-limit-timewindow-settings"></a>

### `new RateLimit(name, limit, timeWindow, [settings])`
Create a new rate limit

- `name` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The name of the rate limit
- `limit` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of attempts allowed per time window (e.g. 60)
- `timeWindow` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The time window in seconds (e.g. 60)
- `settings` [`RateLimitSettings`](#interface-ratelimitsettings) or [`Record<string, any>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) Settings for this rate limit
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

<a name="ratelimitmiddleware-source"></a>

### `rateLimit.middleware(source)`
Express.js middleware to make a rate limit attempt and also send rate limit headers.

- `source` [`RateLimit.SourceFromReq`](#type-ratelimitsourcefromreq) A function that is called with the Express request object and returns a source ID
- Returns: [`e.RequestHandler`](https://expressjs.com/en/guide/using-middleware.html) Express.js middleware

<a name="ratelimitname"></a>

### `rateLimit.name`
Get rate limit name

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
- Readonly

<a name="ratelimitrequestsource-req-res"></a>

### `rateLimit.request(source, req, res)`
Make a rate limit attempt and also send rate limit headers.

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `req` [`e.Request`](https://expressjs.com/en/api.html#req) Express request object
- `res` [`e.Response`](https://expressjs.com/en/api.html#res) Express response object
- Returns: [`AttemptResult`](#interface-attemptresult)

<a name="ratelimitresetsource"></a>

### `rateLimit.reset(source)`
Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitresponseattempt-req-res-next"></a>

### `rateLimit.response(attempt, req, res, [next])`
Send rate limit response that is set in the settings.

- `attempt` [`AttemptResult`](#interface-attemptresult) The attempt result
- `req` [`e.Request`](https://expressjs.com/en/api.html#req) Express request object
- `res` [`e.Response`](https://expressjs.com/en/api.html#res) Express response object
- `next` [`e.NextFunction`](https://expressjs.com/en/guide/using-middleware.html) Call next middleware
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitsetremainingsource-remaining"></a>

### `rateLimit.setRemaining(source, remaining)`
Set the remaining attempts for a source ID.

> **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.

- `source` [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Unique source identifier (e.g. username, IP, etc.)
- `remaining` [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) The number of remaining attempts
- Returns: [`void`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type)

<a name="ratelimitsettings"></a>

### `rateLimit.settings`
Settings for this rate limit

- Type: [`RateLimitSettings`](#interface-ratelimitsettings)

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

## Interface: `RateLimitSettings`
Rate limit settings

<a name="ratelimitsettingssendheaders"></a>

### `rateLimitSettings.sendHeaders`
Automatically send rate limit headers when using `.request()` and `.middleware()`. Individual headers can be disabled by setting them to `null` in the `headers` object.

- Type: [`boolean`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
- Default: `true`

<a name="ratelimitsettingsheaders"></a>

### `rateLimitSettings.headers`
Name of the headers to send. Set a specific header to `null` to disable it. This has no effect if `sendHeaders` is `false`.

- Type: [`Record<string, string | null>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)

<a name="ratelimitsettingsheaderslimit"></a>

#### `rateLimitSettings.headers.limit`
Indicates the service limit associated to the client in the current time-window.

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type)
- Default: `'RateLimit-Limit'`

<a name="ratelimitsettingsheadersremaining"></a>

#### `rateLimitSettings.headers.remaining`
Indicates the remaining quota units (attempts).

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type)
- Default: `'RateLimit-Remaining'`

<a name="ratelimitsettingsheadersreset"></a>

#### `rateLimitSettings.headers.reset`
Indicates the number of seconds until the quota resets.

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type)
- Default: `'RateLimit-Reset'`

<a name="ratelimitsettingsheaderspolicy"></a>

#### `rateLimitSettings.headers.policy`
Indicates the quota associated to the client and its value is informative. See [IETF RateLimit Fields for HTTP, Section 2.3](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers#section-2.3)

> **Note**: This feature is experimental. Policy reporting is not implemented yet. This is reserved for future use.

- Type: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) or [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type)
- Default: `'RateLimit-Policy'`

## Namespace: `RateLimit`

<a name="type-ratelimitsourcefromreq"></a>

### Type: `RateLimit.SourceFromReq`
A function that is called with the Express request object and returns a source ID

- Type: [`function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)
- Parameters:
  - `req` [`e.Request`](https://expressjs.com/en/api.html#req) The Express request object
- Returns: [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) A unique source identifier (e.g. username, IP, etc.)
