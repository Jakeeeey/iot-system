/**
 * ACCESS Professional - Universal RFID Card & Wiegand Formatter
 * Ported to TypeScript for Next.js Access Control module.
 */

export interface ParsedRfidCard {
    wiegandNum: number;
    cardNumber: number;
    facility: number;
    cardId: number;
    raw10D: string | null;
    wiegandStr: string;
}

export interface NormalizedCardResult {
    cardNumber: number;
    wiegandNum: number;
    facility: number;
    cardId: number;
    wiegandStr: string;
    raw10D: string | null;
}

/**
 * Formats facility code and card ID into standard Wiegand display string
 * e.g., facility 111, card 56292 -> "111,56292"
 */
export function formatWiegand(facility: number | string, cardId: number | string): string {
    const fac = Number(facility) || 0;
    const cid = Number(cardId) || 0;
    return `${fac},${String(cid).padStart(5, "0")}`;
}

/**
 * Universal RFID Card Formatter & 10D <-> Wiegand Converter
 * Handles:
 * - Standard 24-bit Wiegand (up to 16,777,215)
 * - 32-bit Raw 10-Digit decimal format (> 16,777,215 and <= 4,294,967,295)
 */
export function normalizeCardNumber(input: unknown): NormalizedCardResult {
    if (input === null || input === undefined || input === "") {
        return {
            cardNumber: 0,
            wiegandNum: 0,
            facility: 0,
            cardId: 0,
            wiegandStr: "0,00000",
            raw10D: null,
        };
    }

    try {
        const cleanStr = String(input).trim().replace(/[^0-9]/g, "");
        if (!cleanStr) {
            return {
                cardNumber: 0,
                wiegandNum: 0,
                facility: 0,
                cardId: 0,
                wiegandStr: "---",
                raw10D: null,
            };
        }

        const num = BigInt(cleanStr);

        // 10-digit 32-bit format (facility in high byte of 24-bit payload, card ID in low 16 bits)
        if (num > 16777215n && num <= 4294967295n) {
            const facility = Number((num >> 16n) & 0xffn);
            const cardId = Number(num & 0xffffn);
            const wiegand = facility * 100000 + cardId;
            return {
                cardNumber: wiegand,
                wiegandNum: wiegand,
                facility,
                cardId,
                wiegandStr: formatWiegand(facility, cardId),
                raw10D: num.toString(),
            };
        }

        const n = Number(num);
        const facility = Math.floor(n / 100000);
        const cardId = n % 100000;
        return {
            cardNumber: n,
            wiegandNum: n,
            facility,
            cardId,
            wiegandStr: formatWiegand(facility, cardId),
            raw10D: null,
        };
    } catch {
        const n = parseInt(String(input), 10) || 0;
        const facility = Math.floor(n / 100000);
        const cardId = n % 100000;
        return {
            cardNumber: n,
            wiegandNum: n,
            facility,
            cardId,
            wiegandStr: "---",
            raw10D: null,
        };
    }
}

/**
 * RFID parser helper for card numbers in forms, logs, and badge events
 */
export function parseRfidCard(rawVal: unknown): ParsedRfidCard | null {
    if (rawVal === null || rawVal === undefined || rawVal === "") return null;
    const cleanStr = String(rawVal).trim().replace(/[^0-9]/g, "");
    if (!cleanStr) return null;

    const res = normalizeCardNumber(cleanStr);
    if (res.cardNumber === 0 && cleanStr !== "0") return null;

    return {
        wiegandNum: res.wiegandNum,
        cardNumber: res.cardNumber,
        facility: res.facility,
        cardId: res.cardId,
        raw10D: res.raw10D,
        wiegandStr: `${res.facility}, ${String(res.cardId).padStart(5, "0")}`,
    };
}
