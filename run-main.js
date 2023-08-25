import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDirectory = join(__dirname, "dist");
const files = readdirSync(distDirectory).filter(
  (file) => file.startsWith("main.") && file.endsWith(".js")
);

if (files.length >= 1) {
  const childProcess = spawn("node", [`dist/${files[0]}`], {
    stdio: "inherit",
  });
  childProcess.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
} else {
  console.error("No main hash files found in the dist directory.");
}
