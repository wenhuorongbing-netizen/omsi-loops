import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number.parseInt(process.argv[2] ?? process.env.PORT ?? "5500", 10);
const host = process.env.HOST ?? "127.0.0.1";

if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid port: ${process.argv[2] ?? process.env.PORT}`);
}

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

function getFilePath(urlPath) {
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

const server = createServer((request, response) => {
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

    const filePath = getFilePath(request.url === "/" ? "/index.html" : request.url);

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

server.listen(port, host, () => {
    console.log(`Static server running at http://${host}:${port}`);
    console.log(`Serving files from ${rootDir}`);
});
