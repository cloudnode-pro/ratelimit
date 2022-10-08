import {AttemptResult} from "./AttemptResult";
import {RateLimitSettings} from "./RateLimitSettings";
import e from "express";

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
    static #instances = new Map<string, RateLimit>();

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
    #attempts = new Map<string, [number, number]>();

    /**
     * Global rate limit settings. These will apply to all rate limits.
     * @type {RateLimitSettings}
     * @static
     */
    static settings: RateLimitSettings = {
        sendHeaders: true,
        headers: {
            limit: "RateLimit-Limit",
            remaining: "RateLimit-Remaining",
            reset: "RateLimit-Reset",
            //policy: "RateLimit-Policy"
            policy: null
        },
        resetHeaderValue: (reset: number) => reset.toString(),
        defaultResponse: (attempt: AttemptResult, req: e.Request, res: e.Response, next?: e.NextFunction) => {
            process.emitWarning("You are using the default rate limit response", {
                code: "RATELIMIT_DEFAULT_RESPONSE",
                detail: "This is not recommended. Please set a custom response by modifying the rate limit settings (`RateLimit.settings.defaultResponse` or `RateLimit.settings.defaultResponse`). Check the documentation for more information."
            });
            res.set("Retry-After", attempt.reset.toString());
            res.status(429).send("Too Many Requests");
        }
    };

    /**
     * Name of the rate limit
     * @readonly
     * @type {string}
     */
    readonly name: string;

    /**
     * The number of requests allowed per time window
     * @type {number}
     */
    limit: number;

    /**
     * The time window in seconds (e.g. 60)
     * @type {number}
     */
    timeWindow: number;

    /**
     * Settings for this rate limit
     * @type {RateLimitSettings}
     */
    settings: RateLimitSettings = RateLimit.settings;

    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of requests allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @param {RateLimitSettings|Record<string, any>} [settings] - Settings for this rate limit
     * @returns {RateLimit}
     * @throws {Error} - If the rate limit already exists
     */
    constructor(name: string, limit: number, timeWindow: number, settings?: RateLimitSettings | Record<string, any>) {
        if (RateLimit.#instances.has(name)) throw new Error(`Rate limit with name "${name}" already exists`);
        this.name = name;
        this.limit = limit;
        this.timeWindow = timeWindow;
        if (settings) Object.assign(this.settings, settings);
        RateLimit.#instances.set(name, this);
    }

    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    check(source: string, callback?: (result: AttemptResult) => void): AttemptResult {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const attempts = this.#attempts.get(source) ?? [0, Date.now()];
        const remaining = this.limit - attempts[0];
        const reset = Math.ceil((attempts[1] + (this.timeWindow * 1000) - Date.now()) / 1000);
        const result: AttemptResult = {
            limit: this.limit,
            remaining,
            reset,
            rateLimit: this,
            allow: remaining > 0
        };
        if (callback) callback(result);
        return result;
    }

    /**
     * Make an attempt with a source ID
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    attempt(source: string, attempts: number = 1, callback?: (result: AttemptResult) => void): AttemptResult {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
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
    reset(source: string): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.delete(source);
    }

    /**
     * Make a rate limit attempt and also send rate limit headers.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @returns {AttemptResult}
     */
    request(source: string, req: e.Request, res: e.Response): AttemptResult {
        const result = this.attempt(source);
        if (this.settings.sendHeaders) {
            if (this.settings.headers.limit !== null) res.setHeader(this.settings.headers.limit, this.limit);
            if (this.settings.headers.remaining !== null) res.setHeader(this.settings.headers.remaining, result.remaining.toString());
            if (this.settings.headers.reset !== null) res.setHeader(this.settings.headers.reset, this.settings.resetHeaderValue(result.reset));
            if (this.settings.headers.policy !== null) res.setHeader(this.settings.headers.policy, "not implemented");
        }
        return result;
    }

    /**
     * Send rate limit response that is set in the settings.
     * @param {AttemptResult} attempt - The attempt result
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @param {function(): void} [next] - Call next middleware
     * @returns {void}
     */
    response(attempt: AttemptResult, req: e.Request, res: e.Response, next?: e.NextFunction): void {
        this.settings.defaultResponse(attempt, req, res, next);
    }
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} remaining - The number of remaining attempts
     * @returns {void}
     */
    setRemaining(source: string, remaining: number): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const data = this.#attempts.get(source) ?? [0, Date.now()];
        data[0] = this.limit - remaining;
        this.#attempts.set(source, data);
    }

    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @returns {void}
     */
    clear(): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.clear();
    }

    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @returns {void}
     */
    delete(): void {
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
    static get(name: string): RateLimit | null {
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
    static check(name: string, source: string, callback?: (result: AttemptResult) => void): AttemptResult {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
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
    static attempt(name: string, source: string, attempts: number = 1, callback?: (result: AttemptResult) => void): AttemptResult {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
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
    static reset(name: string, source: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
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
    static setRemaining(name: string, source: string, remaining: number): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.setRemaining(source, remaining);
    }

    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static clear(name: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.clear();
    }

    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static delete(name: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
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
    static create(name: string, limit: number, timeWindow: number): RateLimit {
        const existing = RateLimit.get(name);
        if (existing) return existing;
        return new RateLimit(name, limit, timeWindow);
    }
}
