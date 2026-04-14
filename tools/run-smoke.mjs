import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "./static-server-lib.mjs";
import { runRuntimeSmoke } from "../tests/smoke/runtime-smoke.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.resolve(rootDir, "output/smoke/runtime");

const server = await startStaticServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
});

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
