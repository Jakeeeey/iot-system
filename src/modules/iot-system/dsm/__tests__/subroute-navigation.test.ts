import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

const DSM_ROUTES = [
    { path: "/iot-system/dsm", title: "Energy Flow & Fleet" },
    { path: "/iot-system/dsm/accounts", title: "Accounts & Plants" },
    { path: "/iot-system/dsm/hardware-telemetry", title: "Hardware Telemetry" },
    { path: "/iot-system/dsm/yield-arbitrage", title: "Yield & Arbitrage" },
    { path: "/iot-system/dsm/trigonometric-analytics", title: "Trigonometric Analytics" },
    { path: "/iot-system/dsm/api-diagnostics", title: "API Diagnostics" },
];

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url);
            if (res.status === 200 || i === retries - 1) return res;
            await new Promise((r) => setTimeout(r, 500));
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise((r) => setTimeout(r, 500));
        }
    }
    return fetch(url);
}

for (const route of DSM_ROUTES) {
    test(`DSM Route ${route.path} (${route.title}) returns 200 OK`, { concurrency: 1 }, async () => {
        const res = await fetchWithRetry(`${BASE_URL}${route.path}`);
        assert.equal(res.status, 200, `Expected 200 OK for ${route.path}, got ${res.status}`);
        const html = await res.text();
        assert.ok(html.includes("<!DOCTYPE html>"), `Route ${route.path} should return valid HTML`);
    });
}

test("DSM APIs return 200 OK with live or standalone data", { concurrency: 1 }, async () => {
    const endpoints = [
        "/api/deye/accounts",
        "/api/deye/aggregate",
        "/api/auth/session",
    ];

    for (const ep of endpoints) {
        const res = await fetchWithRetry(`${BASE_URL}${ep}`);
        assert.equal(res.status, 200, `API ${ep} expected 200 OK, got ${res.status}`);
        const json = await res.json();
        assert.ok(json !== null && typeof json === "object", `API ${ep} should return valid JSON object`);
    }
});
