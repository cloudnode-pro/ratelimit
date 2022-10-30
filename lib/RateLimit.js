/**
 * Rate limit
 * @class
 */
export class RateLimit {
    /**
     * Rate limit instances
     * @private
     * @static
     * @type {Map<string, RateLimit>}
     */
    static #instances = new Map();
    /**
     * Whether this rate limit is deleted
     * @private
     * @type {boolean}
     */
    #deleted = false;
    /**
     * Attempts memory
     * @private
     * @type {Map<string, [number, number]>}
     */
    #attempts = new Map();
    /**
     * Name of the rate limit
     * @readonly
     * @type {string}
     */
    name;
    /**
     * The number of requests allowed per time window
     * @type {number}
     */
    limit;
    /**
     * The time window in seconds (e.g. 60)
     * @type {number}
     */
    timeWindow;
    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of requests allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @returns {RateLimit}
     * @throws {Error} - If the rate limit already exists
     */
    constructor(name, limit, timeWindow) {
        if (RateLimit.#instances.has(name))
            throw new Error(`Rate limit with name "${name}" already exists`);
        this.name = name;
        this.limit = limit;
        this.timeWindow = timeWindow;
        RateLimit.#instances.set(name, this);
    }
    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    check(source, callback) {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const attempts = this.#attempts.get(source) ?? [0, Date.now()];
        const remaining = this.limit - attempts[0];
        const reset = Math.ceil((attempts[1] + (this.timeWindow * 1000) - Date.now()) / 1000);
        const result = {
            limit: this.limit,
            remaining,
            reset,
            rateLimit: this,
            allow: remaining > 0
        };
        if (callback)
            callback(result);
        return result;
    }
    /**
     * Make an attempt with a source ID
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    attempt(source, attempts = 1, callback) {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const data = this.#attempts.get(source) ?? [0, Date.now()];
        // if the time window has expired, reset the attempts
        if (data[1] + (this.timeWindow * 1000) < Date.now()) {
            data[0] = 0;
            data[1] = Date.now();
        }
        // increment the attempts
        data[0] += attempts;
        this.#attempts.set(source, data);
        return this.check(source, callback);
    }
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @returns {void}
     */
    reset(source) {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.delete(source);
    }
    /**
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} remaining - The number of remaining attempts
     * @returns {void}
     */
    setRemaining(source, remaining) {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const data = this.#attempts.get(source) ?? [0, Date.now()];
        data[0] = this.limit - remaining;
        this.#attempts.set(source, data);
    }
    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @returns {void}
     */
    clear() {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.clear();
    }
    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @returns {void}
     */
    delete() {
        this.clear();
        this.#deleted = true;
        RateLimit.#instances.delete(this.name);
    }
    /**
     * Get a rate limit instance
     * @param {string} name - The name of the rate limit
     * @returns {RateLimit | null}
     * @static
     */
    static get(name) {
        return RateLimit.#instances.get(name) ?? null;
    }
    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static check(name, source, callback) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.check(source, callback);
    }
    /**
     * Make an attempt with a source ID
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static attempt(name, source, attempts = 1, callback) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.attempt(source, attempts, callback);
    }
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static reset(name, source) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.reset(source);
    }
    /**
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} remaining - The number of remaining attempts
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static setRemaining(name, source, remaining) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.setRemaining(source, remaining);
    }
    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static clear(name) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.clear();
    }
    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static delete(name) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.delete();
    }
    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of attempts allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @returns {RateLimit}
     * @static
     */
    static create(name, limit, timeWindow) {
        const existing = RateLimit.get(name);
        if (existing)
            return existing;
        return new RateLimit(name, limit, timeWindow);
    }
}
