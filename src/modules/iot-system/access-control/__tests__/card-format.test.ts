import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCardNumber, parseRfidCard, formatWiegand } from "../lib/card-format";

test("formatWiegand formats facility and cardId with 5-digit padding", () => {
    assert.equal(formatWiegand(111, 56292), "111,56292");
    assert.equal(formatWiegand(1, 42), "1,00042");
    assert.equal(formatWiegand(0, 0), "0,00000");
});

test("normalizeCardNumber handles standard 24-bit cards (<= 16777215)", () => {
    const res = normalizeCardNumber(11156292);
    assert.equal(res.cardNumber, 11156292);
    assert.equal(res.facility, 111);
    assert.equal(res.cardId, 56292);
    assert.equal(res.wiegandStr, "111,56292");
    assert.equal(res.raw10D, null);
});

test("normalizeCardNumber converts 32-bit 10-digit cards (> 16777215)", () => {
    const rawVal = 16909060;
    const num = BigInt(rawVal);
    const facility = Number((num >> 16n) & 0xFFn);
    const cardId = Number(num & 0xFFFFn);
    const expectedWiegand = facility * 100000 + cardId;

    const res = normalizeCardNumber(rawVal);
    assert.equal(res.facility, facility);
    assert.equal(res.cardId, cardId);
    assert.equal(res.cardNumber, expectedWiegand);
    assert.equal(res.raw10D, "16909060");
});

test("normalizeCardNumber handles edge cases and invalid inputs gracefully", () => {
    const nullRes = normalizeCardNumber(null as unknown as string);
    assert.equal(nullRes.cardNumber, 0);
    assert.equal(nullRes.facility, 0);

    const undefRes = normalizeCardNumber(undefined as unknown as string);
    assert.equal(undefRes.cardNumber, 0);

    const emptyRes = normalizeCardNumber("");
    assert.equal(emptyRes.cardNumber, 0);

    const stringRes = normalizeCardNumber("   12345   ");
    assert.equal(stringRes.cardNumber, 12345);
    assert.equal(stringRes.facility, 0);
    assert.equal(stringRes.cardId, 12345);
});

test("parseRfidCard provides frontend-compatible properties", () => {
    const parsed = parseRfidCard("11156292");
    assert.ok(parsed);
    assert.equal(parsed!.wiegandNum, 11156292);
    assert.equal(parsed!.cardNumber, 11156292);
    assert.equal(parsed!.facility, 111);
    assert.equal(parsed!.cardId, 56292);
    assert.equal(parsed!.wiegandStr, "111, 56292");

    assert.equal(parseRfidCard(null as unknown as string), null);
    assert.equal(parseRfidCard(""), null);
});

test("normalizeCardNumber boundary numbers and invalid string paths", () => {
    const edge24 = normalizeCardNumber(16777215);
    assert.equal(edge24.cardNumber, 16777215);
    assert.equal(edge24.raw10D, null, "24-bit max boundary must have null raw10D");

    const edge32Low = normalizeCardNumber(16777216);
    assert.equal(edge32Low.raw10D, "16777216", "16777216 must enter 32-bit path with raw10D");

    const edge32High = normalizeCardNumber(4294967295);
    assert.equal(edge32High.raw10D, "4294967295", "4294967295 must enter 32-bit path");
    assert.equal(edge32High.facility, 255);
    assert.equal(edge32High.cardId, 65535);

    const edgeOverflow = normalizeCardNumber(4294967296);
    assert.equal(edgeOverflow.raw10D, null, "> 4294967295 must not be treated as 32-bit 10D");

    const emptyRes = normalizeCardNumber("");
    assert.equal(emptyRes.cardNumber, 0);
    assert.equal(emptyRes.raw10D, null);

    const nonNumRes = normalizeCardNumber("abc");
    assert.equal(nonNumRes.cardNumber, 0);
    assert.equal(nonNumRes.raw10D, null);
    assert.equal(nonNumRes.wiegandStr, "---");
});
