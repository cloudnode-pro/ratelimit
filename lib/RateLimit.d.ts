import { AttemptResult } from "./AttemptResult";
/**
 * Rate limit
 * @class
 */
export declare class RateLimit {
    #private;
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
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of requests allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @returns {RateLimit}
     * @throws {Error} - If the rate limit already exists
     */
    constructor(name: string, limit: number, timeWindow: number);
    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    check(source: string, callback?: (result: AttemptResult) => void): AttemptResult;
    /**
     * Make an attempt with a source ID
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} [attempts=1] - The number of attempts to make
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     */
    attempt(source: string, attempts?: number, callback?: (result: AttemptResult) => void): AttemptResult;
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @returns {void}
     */
    reset(source: string): void;
    /**
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {number} remaining - The number of remaining attempts
     * @returns {void}
     */
    setRemaining(source: string, remaining: number): void;
    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @returns {void}
     */
    clear(): void;
    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @returns {void}
     */
    delete(): void;
    /**
     * Get a rate limit instance
     * @param {string} name - The name of the rate limit
     * @returns {RateLimit | null}
     * @static
     */
    static get(name: string): RateLimit | null;
    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {function(AttemptResult): void} [callback] - Return data in a callback
     * @returns {AttemptResult}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static check(name: string, source: string, callback?: (result: AttemptResult) => void): AttemptResult;
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
    static attempt(name: string, source: string, attempts?: number, callback?: (result: AttemptResult) => void): AttemptResult;
    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static reset(name: string, source: string): void;
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
    static setRemaining(name: string, source: string, remaining: number): void;
    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static clear(name: string): void;
    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @param {string} name - The name of the rate limit
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static delete(name: string): void;
    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of attempts allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @returns {RateLimit}
     * @static
     */
    static create(name: string, limit: number, timeWindow: number): RateLimit;
}
//# sourceMappingURL=RateLimit.d.ts.map