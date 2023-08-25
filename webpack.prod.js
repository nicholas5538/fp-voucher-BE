import common from "./webpack.common.js";
import Dotenv from "dotenv-webpack";
import { merge } from "webpack-merge";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const module = merge(common, {
  mode: "production",
  devtool: false,
  plugins: [new Dotenv({ path: ".env.production" })],
  output: {
    clean: false,
    compareBeforeEmit: false,
    enabledLibraryTypes: ["module"],
    filename: "main.[fullhash].js",
    library: { type: "module" },
    path: resolve(__dirname, "dist"),
  },
});

export default module;
