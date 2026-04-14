import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const defaultRootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
};

function getFilePath(rootDir, urlPath) {
    const pathname = decodeURIComponent(urlPath.split("?")[0]);
    const normalizedPath = normalize(pathname).replace(/^([/\\])?(\.\.[/\\])+/, "");
    let filePath = resolve(rootDir, `.${normalizedPath}`);

    if (!filePath.startsWith(rootDir)) {
        return null;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
    }

    return filePath;
}

export function createStaticServer({rootDir = defaultRootDir} = {}) {
    return createServer((request, response) => {
        if (!request.url) {
            response.writeHead(400);
            response.end("Bad Request");
            return;
        }

        if (!["GET", "HEAD"].includes(request.method ?? "")) {
            response.writeHead(405, {"Content-Type": "text/plain; charset=utf-8"});
            response.end("Method Not Allowed");
            return;
        }

        const filePath = getFilePath(rootDir, request.url === "/" ? "/index.html" : request.url);

        if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
            response.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
            response.end("Not Found");
            return;
        }

        const contentType = contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream";
        response.writeHead(200, {"Content-Type": contentType});

        if (request.method === "HEAD") {
            response.end();
            return;
        }

        createReadStream(filePath).pipe(response);
    });
}

export async function startStaticServer({rootDir = defaultRootDir, host = "127.0.0.1", port = 5500} = {}) {
    if (!Number.isInteger(port) || port < 0) {
        throw new Error(`Invalid port: ${port}`);
    }

    const server = createStaticServer({rootDir});
    await new Promise((resolvePromise, rejectPromise) => {
        server.once("error", rejectPromise);
        server.listen(port, host, () => {
            server.off("error", rejectPromise);
            resolvePromise();
        });
    });

    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Unexpected server address");
    }

    return {
        host,
        port: address.port,
        rootDir,
        server,
        url: `http://${host}:${address.port}`,
        async close() {
            await new Promise((resolvePromise, rejectPromise) => {
                server.close(error => error ? rejectPromise(error) : resolvePromise());
            });
        },
    };
}
