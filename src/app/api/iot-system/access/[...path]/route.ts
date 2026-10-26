import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.ACCESS_GATEWAY_URL || "http://127.0.0.1:3001";

async function proxyRequest(request: NextRequest, subpath: string[]) {
    try {
        const targetPath = subpath.join("/");
        const search = request.nextUrl.search;
        const targetUrl = `${GATEWAY_URL.replace(/\/+$/, "")}/api/${targetPath}${search}`;

        const headers = new Headers();
        request.headers.forEach((value, key) => {
            if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
                headers.set(key, value);
            }
        });

        const init: RequestInit = {
            method: request.method,
            headers,
        };

        if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
            const body = await request.text();
            if (body) {
                init.body = body;
            }
        }

        const gatewayRes = await fetch(targetUrl, init);
        const data = await gatewayRes.text();

        const responseHeaders = new Headers();
        gatewayRes.headers.forEach((value, key) => {
            if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        return new NextResponse(data, {
            status: gatewayRes.status,
            headers: responseHeaders,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gateway unreachable";
        return NextResponse.json(
            { success: false, error: `Access Control Gateway connection error: ${msg}` },
            { status: 502 }
        );
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}