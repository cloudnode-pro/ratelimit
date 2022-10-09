/**
 * Rate limit
 * @class
 */
export class RateLimit {
    /**
     * Rate limit instances
     * @private
     * @static
     */
    static #instances = new Map();
    /**
     * Whether this rate limit is deleted
     * @private
     */
    #deleted = false;
    /**
     * Attempts memory
     * @private
     */
    #attempts = new Map();
    /**
     * Name of the rate limit
     * @readonly
     */
    name;
    /**
     * The number of requests allowed per time window
     */
    limit;
    /**
     * The time window in seconds (e.g. 60)
     */
    timeWindow;
    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of requests allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
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
     */
    check(source) {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const attempts = this.#attempts.get(source) ?? [0, Date.now()];
        const remaining = this.limit - attempts[0];
        const reset = Math.ceil((attempts[1] + (this.timeWindow * 1000) - Date.now()) / 1000);
        return {
            limit: this.limit,
            remaining,
            reset,
            rateLimit: this,
            allow: remaining > 0
        };
    }
    /**
     * Make an attempt with a source ID
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     */
    attempt(source, attempts = 1) {
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
        return this.check(source);
    }
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
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
     */
    clear() {
        if (this.#deleted)
            throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.clear();
    }
    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     */
    delete() {
        this.clear();
        this.#deleted = true;
        RateLimit.#instances.delete(this.name);
    }
    /**
     * Get a rate limit instance
     * @param {string} name - The name of the rate limit
     * @static
     */
    static get(name) {
        return RateLimit.#instances.get(name) ?? null;
    }
    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static check(name, source) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.check(source);
    }
    /**
     * Make an attempt with a source ID
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static attempt(name, source, attempts = 1) {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit)
            throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.attempt(source, attempts);
    }
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
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
     * @static
     */
    static create(name, limit, timeWindow) {
        const existing = RateLimit.get(name);
        if (existing)
            return existing;
        return new RateLimit(name, limit, timeWindow);
    }
}
