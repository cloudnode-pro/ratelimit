import assert from 'assert';
import {RateLimit} from "../lib/RateLimit.js";

describe("RateLimit", () => {
    describe("instance methods", () => {
        it("should create a new RateLimit instance", () => {
            assert(new RateLimit("test", 5, 1) instanceof RateLimit);
        });
        it("should not allow creating a new instance with the same name", () => {
            assert.throws(() => new RateLimit("test", 5, 1));
        });
        it("should fetch the existing RateLimit instance", () => {
            assert(RateLimit.get("test") instanceof RateLimit);
        });
        it("should decrement the remaining attempts", () => {
            const rateLimit = RateLimit.get("test");
            const result = rateLimit.attempt("source1");
            assert(result.remaining === 4);
        });
        it("should check the remaining attempts", () => {
            const rateLimit = RateLimit.get("test");
            const result = rateLimit.check("source1");
            assert(result.remaining === 4);
        });
        it("should prevent attempts when the limit is reached", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.attempt("source1"); // 3 remaining
            rateLimit.attempt("source1"); // 2 remaining
            rateLimit.attempt("source1"); // 1 remaining
            rateLimit.attempt("source1"); // 0 remaining
            const result = rateLimit.attempt("source1"); // -1 remaining
            assert.strictEqual(result.allow, false);
        });
        it("should reset the remaining attempts after the timeout", async () => {
            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            const rateLimit = RateLimit.get("test");
            await sleep(1500);
            assert.strictEqual(rateLimit.attempt("source1").allow, true);
        });
        it("should reset the remaining attempts", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.reset("source1");
            assert.strictEqual(rateLimit.check("source1").remaining, 5);
        });
        it("should set the remaining attempts", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.setRemaining("source1", 3);
            assert.strictEqual(rateLimit.check("source1").remaining, 3);
        });
        it("should reset all attempts", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.attempt("source2");
            rateLimit.attempt("source3");
            rateLimit.clear();
            assert.strictEqual(rateLimit.check("source1").remaining, 5);
            assert.strictEqual(rateLimit.check("source2").remaining, 5);
            assert.strictEqual(rateLimit.check("source3").remaining, 5);
        });
        it("should return check result in callback", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.check("source1", result => {
                assert.strictEqual(result.allow, true);
            });
        });
        it("should delete the RateLimit instance", () => {
            const rateLimit = RateLimit.get("test");
            rateLimit.attempt("source1");
            rateLimit.delete();
            assert.strictEqual(RateLimit.get("test"), null);
            assert.throws(() => rateLimit.check("source1"), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.attempt("source1"), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.reset("source1"), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.setRemaining("source1", 3), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.clear(), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.cleanup(), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
            assert.throws(() => rateLimit.delete(), {message: "Rate limit \"test\" has been deleted. Construct a new instance"});
        });
    });
    describe("static methods", () => {
        it("should create a new RateLimit instance", () => {
            const rateLimit = RateLimit.create("test", 5, 1);
            assert(rateLimit instanceof RateLimit);
        });
        it("should return the same instance if created with the same name", () => {
            const rateLimit1 = RateLimit.create("test", 10, 1);
            assert(rateLimit1.limit === 5);
        });
        it("should make a rate limit attempt", () => {
            const result = RateLimit.attempt("test", "source1");
            assert(result.remaining === 4);
        });
        it("should make an attempt with custom weight", () => {
            const result = RateLimit.attempt("test", "source1", 2);
            assert(result.remaining === 2);
        });
        it("should check the remaining attempts", () => {
            const result = RateLimit.check("test", "source1");
            assert(result.remaining === 2);
        });
        it("should prevent attempts when the limit is reached", () => {
            RateLimit.attempt("test", "source1"); // 1 remaining
            RateLimit.attempt("test", "source1"); // 0 remaining
            const result = RateLimit.attempt("test", "source1"); // -1 remaining
            assert.strictEqual(result.allow, false);
        });
        it("should reset the remaining attempts after the timeout", async () => {
            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            await sleep(1500);
            assert.strictEqual(RateLimit.attempt("test", "source1").allow, true);
        });
        it("should reset the remaining attempts", () => {
            RateLimit.reset("test", "source1");
            assert.strictEqual(RateLimit.check("test", "source1").remaining, 5);
        });
        it("should set the remaining attempts", () => {
            RateLimit.setRemaining("test", "source1", 3);
            assert.strictEqual(RateLimit.check("test", "source1").remaining, 3);
        });
        it("should reset all attempts", () => {
            RateLimit.attempt("test", "source2");
            RateLimit.attempt("test", "source3");
            RateLimit.clear("test");
            assert.strictEqual(RateLimit.check("test", "source1").remaining, 5);
            assert.strictEqual(RateLimit.check("test", "source2").remaining, 5);
            assert.strictEqual(RateLimit.check("test", "source3").remaining, 5);
        });
        it("should clear expired attempts", async () => {
            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            RateLimit.attempt("test", "source1");
            await sleep(1500);
            RateLimit.cleanup("test");
            assert.strictEqual(RateLimit.check("test", "source1").remaining, 5);
        });
        it("should clear expired attempts from all rate limits", async () => {
            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            RateLimit.attempt("test", "source1");
            new RateLimit("test2", 5, 1).attempt("source1");
            await sleep(1500);
            RateLimit.cleanup();
        });
        it("should delete the RateLimit instance", () => {
            RateLimit.attempt("test", "source1");
            RateLimit.delete("test");
            assert.strictEqual(RateLimit.get("test"), null);
            assert.throws(() => RateLimit.check("test", "source1"), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.attempt("test", "source1"), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.reset("test", "source1"), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.setRemaining("test", "source1", 3), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.clear("test"), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.cleanup("test"), {message: "Rate limit with name \"test\" does not exist"});
            assert.throws(() => RateLimit.delete("test"), {message: "Rate limit with name \"test\" does not exist"});
        });
    });
});
