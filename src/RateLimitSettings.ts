/**
 * Rate limit settings
 * @interface RateLimitSettings
 */
interface RateLimitSettings {
    /**
     * Automatically send rate limit headers when using `.request()` and `.middleware()`. Individual headers can be disabled by setting them to `null` in the `headers` object.
     * @type {boolean}
     * @default true
     */
    sendHeaders: boolean;

    /**
     * Name of the headers to send. Set a specific header to `null` to disable it. This has no effect if `sendHeaders` is `false`.
     * @type {Record<string, string | null>}
     */
    headers: {
        /**
         * Indicates the service limit associated to the client in the current time-window.
         * @type {string | null}
         * @default 'RateLimit-Limit'
         */
        limit: string | null;

        /**
         * Indicates the remaining quota units (attempts).
         * @type {string | null}
         * @default 'RateLimit-Remaining'
         */
        remaining: string | null;

        /**
         * Indicates the number of seconds until the quota resets.
         * @type {string | null}
         */
        reset: string | null;

        /**
         * Indicates the quota associated to the client and its value is informative. See [IETF RateLimit Fields for HTTP, Section 2.3](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers#section-2.3)
         * @type {string | null}
         * @experimental Policy reporting is not implemented yet. This is reserved for future use.
         * @TODO Implement policy reporting
         */
        policy: string | null;
    };

    /**
     * Function to transform the value of the `reset` header. This has no effect if `sendHeaders` is `false`.
     * @param {number} reset - The remaining time in seconds until the quota resets
     * @returns {string}
     * @default (reset) => reset.toString()
     */
    resetHeaderValue: (reset: number) => string;
}
