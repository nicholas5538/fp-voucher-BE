import common from "./webpack.common.js";
import Dotenv from "dotenv-webpack";
import { merge } from "webpack-merge";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const module = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [new Dotenv({ path: ".env" })],
  output: {
    clean: true,
    compareBeforeEmit: true,
    enabledLibraryTypes: ["module"],
    filename: "main.js",
    library: { type: "module" },
    path: resolve(__dirname, "dist"),
  },
});

export default module;
