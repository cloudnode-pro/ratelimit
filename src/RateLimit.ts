import {AttemptResult} from "./AttemptResult";

/**
 * Rate limit
 */
export class RateLimit {
    /**
     * Rate limit instances
     * @internal
     */
    static readonly #instances = new Map<string, RateLimit>();

    /**
     * Whether this rate limit is deleted
     * @internal
     */
    #deleted = false;

    /**
     * Attempts memory. First number is attempts, second number is timestamp
     * @internal
     */
    #attempts = new Map<string, [number, number]>();

    /**
     * Create a new rate limit
     * @param name - The name of the rate limit
     * @param limit - The number of requests allowed per time window (e.g. 60)
     * @param timeWindow - The time window in seconds (e.g. 60)
     * @throws {Error} - If the rate limit already exists
     */
    public constructor(public readonly name: string, public readonly limit: number, public readonly timeWindow: number) {
        if (RateLimit.#instances.has(name)) throw new Error(`Rate limit with name "${name}" already exists`);
        RateLimit.#instances.set(name, this);
    }

    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param [callback] - Return data in a callback
     */
    public check(source: string, callback?: (result: AttemptResult) => void): AttemptResult {
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
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param [attempts=1] - The number of attempts to make
     * @param [callback] - Return data in a callback
     */
    public attempt(source: string, attempts: number = 1, callback?: (result: AttemptResult) => void): AttemptResult {
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
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     */
    public reset(source: string): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.delete(source);
    }

    /**
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param remaining - The number of remaining attempts
     */
    public setRemaining(source: string, remaining: number): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const data = this.#attempts.get(source) ?? [0, Date.now()];
        data[0] = this.limit - remaining;
        this.#attempts.set(source, data);
    }

    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     */
    public clear(): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        this.#attempts.clear();
    }

    /**
     * Clean up rate limit attempts storage. This will remove expired entries.
     * @throws {Error} - If the rate limit has been deleted
     */
    public cleanup(): void {
        if (this.#deleted) throw new Error(`Rate limit "${this.name}" has been deleted. Construct a new instance`);
        const now = Date.now();
        for (const [source, [attempts]] of this.#attempts) {
            if (attempts + (this.timeWindow * 1000) < now) this.#attempts.delete(source);
        }
    }

    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     */
    public delete(): void {
        this.clear();
        this.#deleted = true;
        RateLimit.#instances.delete(this.name);
    }

    /**
     * Get a rate limit instance
     * @param name - The name of the rate limit
     */
    public static get(name: string): RateLimit | null {
        return RateLimit.#instances.get(name) ?? null;
    }

    /**
     * Check the attempt state for a source ID without decrementing the remaining attempts
     * @param name - The name of the rate limit
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param [callback] - Return data in a callback
     * @throws {Error} - If the rate limit does not exist
     */
    public static check(name: string, source: string, callback?: (result: AttemptResult) => void): AttemptResult {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.check(source, callback);
    }

    /**
     * Make an attempt with a source ID
     * @param name - The name of the rate limit
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param [attempts=1] - The number of attempts to make
     * @param [callback] - Return data in a callback
     * @throws {Error} - If the rate limit does not exist
     */
    public static attempt(name: string, source: string, attempts: number = 1, callback?: (result: AttemptResult) => void): AttemptResult {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.attempt(source, attempts, callback);
    }

    /**
     * Reset limit for a source ID. The storage entry will be deleted and a new one will be created on the next attempt.
     * @param name - The name of the rate limit
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @throws {Error} - If the rate limit does not exist
     */
    public static reset(name: string, source: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.reset(source);
    }

    /**
     * Set the remaining attempts for a source ID.
     * > **Warning**: This is not recommended as the remaining attempts depend on the limit of the instance.
     * @param name - The name of the rate limit
     * @param source - Unique source identifier (e.g. username, IP, etc.)
     * @param remaining - The number of remaining attempts
     * @throws {Error} - If the rate limit does not exist
     */
    public static setRemaining(name: string, source: string, remaining: number): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.setRemaining(source, remaining);
    }

    /**
     * Clear rate limit attempts storage. This is equivalent to resetting all rate limits.
     * @param name - The name of the rate limit
     * @throws {Error} - If the rate limit does not exist
     */
    public static clear(name: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.clear();
    }

    /**
     * Clean up rate limit attempts storage. This will remove expired entries.
     * @param [name] - The name of the rate limit. If not provided, all rate limits will be cleaned up.
     * @throws {Error} - If the rate limit does not exist
     */
    public static cleanup(name?: string): void {
        if (name) {
            const rateLimit = RateLimit.get(name);
            if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
            return rateLimit.cleanup();
        }
        else for (const rateLimit of RateLimit.#instances.values()) rateLimit.cleanup();
    }

    /**
     * Delete the rate limit instance. After it is deleted, it should not be used any further without constructing a new instance.
     * @param name - The name of the rate limit
     * @throws {Error} - If the rate limit does not exist
     */
    public static delete(name: string): void {
        const rateLimit = RateLimit.get(name);
        if (!rateLimit) throw new Error(`Rate limit with name "${name}" does not exist`);
        return rateLimit.delete();
    }

    /**
     * Create a new rate limit
     * @param name - The name of the rate limit
     * @param limit - The number of attempts allowed per time window (e.g. 60)
     * @param timeWindow - The time window in seconds (e.g. 60)
     */
    public static create(name: string, limit: number, timeWindow: number): RateLimit {
        const existing = RateLimit.get(name);
        if (existing) return existing;
        return new RateLimit(name, limit, timeWindow);
    }
}
