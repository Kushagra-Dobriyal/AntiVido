"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import autocannon from 'autocannon';
const autocannon_1 = __importDefault(require("autocannon"));
const instance = (0, autocannon_1.default)({
    url: 'http://localhost:3000/job',
    method: 'POST',
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({ task: 'summarize', url: 'https://example.com' }),
    connections: 100, // 100 concurrent users
    duration: 10, // for 10 seconds
    pipelining: 1,
}, (err, result) => {
    if (err) {
        console.error('Load test error:', err);
        return;
    }
    console.log('\n========== PULSEQ LOAD TEST RESULTS ==========');
    console.log(`Total requests:     ${result.requests.total}`);
    console.log(`Requests/sec:       ${Math.round(result.requests.average)}`);
    console.log(`Throughput/sec:     ${Math.round(result.throughput.average / 1024)} KB`);
    console.log(`Latency p50:        ${result.latency.p50} ms`);
    console.log(`Latency p99:        ${result.latency.p99} ms`);
    console.log(`Errors:             ${result.errors}`);
    console.log(`Timeouts:           ${result.timeouts}`);
    console.log('===============================================');
    console.log('\nNow check /metrics to see cache hit rate and queue depth!');
});
autocannon_1.default.track(instance, { renderProgressBar: true });
//# sourceMappingURL=loadtest.js.map