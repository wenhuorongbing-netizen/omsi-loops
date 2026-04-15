import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "./static-server-lib.mjs";
import { runRuntimeSmoke } from "../tests/smoke/runtime-smoke.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.resolve(rootDir, "output/smoke/runtime");

async function startSmokeServer() {
    const host = "127.0.0.1";
    const preferredPorts = [
        8200,
        8201,
        8202,
        8203,
        8204,
        8300,
        8400,
        8500,
    ];

    for (const port of preferredPorts) {
        try {
            return await startStaticServer({
                rootDir,
                host,
                port,
            });
        } catch (error) {
            if (error?.code !== "EADDRINUSE") {
                throw error;
            }
        }
    }

    throw new Error(`Could not start smoke server on any preferred port: ${preferredPorts.join(", ")}`);
}

const server = await startSmokeServer();

try {
    console.log(`Smoke server running at ${server.url}`);
    await runRuntimeSmoke({
        baseUrl: server.url,
        outputDir,
    });
    console.log(`Smoke results written to ${outputDir}`);
} finally {
    await server.close();
}
