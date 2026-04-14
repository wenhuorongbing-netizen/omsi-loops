import { defaultRootDir, startStaticServer } from "./static-server-lib.mjs";

const rootDir = defaultRootDir;
const port = Number.parseInt(process.argv[2] ?? process.env.PORT ?? "5500", 10);
const host = process.env.HOST ?? "127.0.0.1";

if (!Number.isInteger(port) || port < 0) {
    throw new Error(`Invalid port: ${process.argv[2] ?? process.env.PORT}`);
}
(async function main() {
    const server = await startStaticServer({rootDir, host, port});
    console.log(`Static server running at ${server.url}`);
    console.log(`Serving files from ${rootDir}`);
    return server;
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
