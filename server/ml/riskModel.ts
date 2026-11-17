import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export interface RiskModel {
  features: string[];
  mean: number[];
  scale: number[];
  coef: number[];
  intercept: number;
  metrics?: Record<string, unknown>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadModel(): RiskModel {
  const filePath = join(__dirname, "risk-model.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as RiskModel;
}

export const defaultModel: RiskModel = loadModel();

/**
 * Computes predicted probability of diabetes using a trained logistic regression model.
 * Formula:
 *   z = intercept + sum(((x - mean) / scale) * coef)
 *   probability = 1 / (1 + Math.exp(-z))
 */
export function predictDiabetesRisk(
  input: Record<string, number>,
  model: RiskModel = defaultModel
): number {
  let z = model.intercept;
  for (let i = 0; i < model.features.length; i++) {
    const featureName = model.features[i];
    const x = input[featureName] ?? 0;
    const mean = model.mean[i] ?? 0;
    const scale = model.scale[i] || 1;
    const coef = model.coef[i] ?? 0;
    z += ((x - mean) / scale) * coef;
  }
  return 1 / (1 + Math.exp(-z));
}

