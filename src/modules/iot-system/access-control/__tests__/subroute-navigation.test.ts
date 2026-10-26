import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

const ROUTES = [
    { path: "/iot-system/access-control", title: "Root (Command Center)" },
    { path: "/iot-system/access-control/command-center", title: "Command Center" },
    { path: "/iot-system/access-control/controllers", title: "Controllers & Doors" },
    { path: "/iot-system/access-control/doors", title: "Doors Alias" },
    { path: "/iot-system/access-control/users", title: "Users & Privileges" },
    { path: "/iot-system/access-control/monitor", title: "Real-Time Monitor" },
    { path: "/iot-system/access-control/history", title: "History Records" },
    { path: "/iot-system/access-control/extended", title: "Extended Functions" },
    { path: "/iot-system/access-control/emergency", title: "Emergency Overrides" },
];

for (const route of ROUTES) {
    test(`Route ${route.path} (${route.title}) returns 200 OK without errors`, async () => {
        const res = await fetch(`${BASE_URL}${route.path}`);
        assert.equal(res.status, 200, `Expected 200 OK for ${route.path}, got ${res.status}`);
        const html = await res.text();
        assert.ok(html.includes("<!DOCTYPE html>"), `Route ${route.path} should return valid HTML`);
        assert.ok(!html.includes("Internal Server Error"), `Route ${route.path} must not contain 500 error`);
    });
}

test("Direct static assets for 1:1 original console return 200 OK", async () => {
    const assets = [
        "/iot-system/access-control/index.html",
        "/iot-system/access-control/styles.css",
        "/iot-system/access-control/app.js",
        "/iot-system/access-control/card-format.js",
        "/iot-system/access-control/web/escape.js",
        "/iot-system/access-control/web/api-prefix.js",
        "/iot-system/access-control/web/views/command-center.js",
        "/iot-system/access-control/web/views/controllers.js",
        "/iot-system/access-control/web/views/users.js",
        "/iot-system/access-control/web/views/monitor.js",
        "/iot-system/access-control/web/views/history.js",
    ];

    for (const asset of assets) {
        const res = await fetch(`${BASE_URL}${asset}`);
        assert.equal(res.status, 200, `Asset ${asset} expected 200 OK, got ${res.status}`);
    }
});
