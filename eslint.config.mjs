import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".cache/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "next.config.ts",
      "dist/**",
      "build/**",
      "*.log",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    extends: ["plugin:tailwindcss/recommended", "plugin:prettier/recommended"],
    plugins: ["tailwindcss"],
    rules: {
      "tailwindcss/classnames-order": "off", // Prettier handles this
    },
  }),
];

export default eslintConfig;
