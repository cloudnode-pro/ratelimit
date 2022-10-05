import {RateLimit} from "./RateLimit";

/**
 * The result from a rate limit attempt
 * @interface
 */
export interface AttemptResult {
    /**
     * The number of requests this rate limit allows per time window
     * @readonly
     */
    readonly limit: number;

    /**
     * The number of requests remaining in the current time window
     * @readonly
     */
    readonly remaining: number;

    /**
     * The number of seconds until the current time window resets
     * @readonly
     */
    readonly reset: number;

    /**
     * The rate limit that this attempt was made on
     * @readonly
     */
    readonly rateLimit: RateLimit;

    /**
     * Whether this attempt should be allowed to proceed. If false, the attempt is rate limited.
     * @readonly
     */
    readonly allow: boolean;
}
