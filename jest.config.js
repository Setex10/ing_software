// jest.config.js
//
// Usa el helper oficial de Next.js (next/jest): transpila con SWC y resuelve
// automáticamente el alias "@/*" definido en jsconfig.json. El entorno es
// "node" porque lo que se prueba es lógica de servidor (modelos, servicios,
// repositorios y utilidades), no componentes de React.

const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // Evita que Jest escanee la carpeta de build (.next/standalone/package.json
  // duplica el nombre de este package.json y generaba un warning de Haste).
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  collectCoverageFrom: [
    "lib/**/*.js",
    "services/**/models/**/*.js",
    "services/**/repositories/**/*.js",
    "services/**/services/**/*.js",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
