import { AttemptResult } from "./AttemptResult";
import { RateLimitSettings } from "./RateLimitSettings";
import e from "express";
/**
 * Rate limit
 * @class
 */
export declare class RateLimit {
    #private;
    /**
     * Global rate limit settings. These will apply to all rate limits.
     * @type {RateLimitSettings}
     * @static
     */
    static settings: RateLimitSettings;
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
    settings: RateLimitSettings;
    /**
     * Create a new rate limit
     * @param {string} name - The name of the rate limit
     * @param {number} limit - The number of requests allowed per time window (e.g. 60)
     * @param {number} timeWindow - The time window in seconds (e.g. 60)
     * @param {RateLimitSettings|Record<string, any>} [settings] - Settings for this rate limit
     * @returns {RateLimit}
     * @throws {Error} - If the rate limit already exists
     */
    constructor(name: string, limit: number, timeWindow: number, settings?: RateLimitSettings | Record<string, any>);
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
     * Make a rate limit attempt and also send rate limit headers.
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @returns {AttemptResult}
     */
    request(source: string, req: e.Request, res: e.Response): AttemptResult;
    /**
     * Send rate limit response that is set in the settings.
     * @param {AttemptResult} attempt - The attempt result
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @param {e.NextFunction} [next] - Call next middleware
     * @returns {void}
     */
    response(attempt: AttemptResult, req: e.Request, res: e.Response, next?: e.NextFunction): void;
    /**
     * Express.js middleware to make a rate limit attempt and also send rate limit headers.
     * @param {function(e.Request): string} source - A function that is called with the Express request object and returns a unique source identifier (e.g. username, IP, etc.)
     * @returns {e.RequestHandler}
     */
    middleware(source: (req: e.Request) => string): e.RequestHandler;
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
     * Make a rate limit attempt and also send rate limit headers.
     * @param {string} name - The name of the rate limit
     * @param {string} source - Unique source identifier (e.g. username, IP, etc.)
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @returns {AttemptResult}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static request(name: string, source: string, req: e.Request, res: e.Response): AttemptResult;
    /**
     * Send rate limit response that is set in the settings.
     * @param {string} [name=null] - The name of the rate limit. Set to `null` to use global settings. Rate limit instances
     * that have not explicitly set a response will automatically inherit the global response setting at the time of
     * construction.
     * @param {AttemptResult} attempt - The attempt result
     * @param {e.Request} req - An Express request object
     * @param {e.Response} res - An Express response object
     * @param {e.NextFunction} [next] - An Express next function
     * @returns {void}
     * @throws {Error} - If the rate limit does not exist (never thrown if `name` is `null`)
     * @static
     */
    static response(name: string | undefined, attempt: AttemptResult, req: e.Request, res: e.Response, next?: e.NextFunction): void;
    /**
     * Express.js middleware to make a rate limit attempt and also send rate limit headers.
     * @param {string} name - The name of the rate limit
     * @param {function(e.Request): string} source - A function that is called with the Express request object and
     * returns a unique source identifier (e.g. username, IP, etc.)
     * @returns {e.RequestHandler}
     * @throws {Error} - If the rate limit does not exist
     * @static
     */
    static middleware(name: string, source: (req: e.Request) => string): e.RequestHandler;
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