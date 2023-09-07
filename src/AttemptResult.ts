import {RateLimit} from "./RateLimit";

/**
 * The result from a rate limit attempt
 */
export interface AttemptResult {
    /**
     * The number of requests this rate limit allows per time window
     */
    readonly limit: number;

    /**
     * The number of requests remaining in the current time window
     */
    readonly remaining: number;

    /**
     * The number of seconds until the current time window resets
     */
    readonly reset: number;

    /**
     * The rate limit that this attempt was made on
     */
    readonly rateLimit: RateLimit;

    /**
     * Whether this attempt should be allowed to proceed. If false, the attempt is rate limited.
     */
    readonly allow: boolean;
}
