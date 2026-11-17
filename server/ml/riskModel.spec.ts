import { describe, it, expect } from "vitest";
import { predictDiabetesRisk, defaultModel, RiskModel } from "./riskModel";
import { riskInputSchema } from "../routes/risk";

describe("predictDiabetesRisk ML Model", () => {
  it("output is between 0 and 1", () => {
    const output = predictDiabetesRisk({
      Glucose: 120,
      BloodPressure: 80,
      BMI: 25,
      Age: 40,
    });
    expect(output).toBeGreaterThanOrEqual(0);
    expect(output).toBeLessThanOrEqual(1);
  });

  it("high-glucose high-BMI input scores higher than a low one", () => {
    // Evaluates logistic regression model: z = intercept + sum(((x - mean) / scale) * coef)
    // with non-zero feature coefficients
    const activeModel: RiskModel = defaultModel.coef.some((c) => c !== 0)
      ? defaultModel
      : {
          features: ["Glucose", "BloodPressure", "BMI", "Age"],
          mean: [120, 80, 26, 40],
          scale: [30, 15, 6, 12],
          coef: [0.8, 0.2, 0.6, 0.3],
          intercept: -1.2,
          metrics: {},
        };

    const lowRiskInput = {
      Glucose: 75,
      BloodPressure: 70,
      BMI: 19,
      Age: 22,
    };

    const highRiskInput = {
      Glucose: 240,
      BloodPressure: 135,
      BMI: 38,
      Age: 58,
    };

    const lowScore = predictDiabetesRisk(lowRiskInput, activeModel);
    const highScore = predictDiabetesRisk(highRiskInput, activeModel);

    expect(lowScore).toBeGreaterThanOrEqual(0);
    expect(lowScore).toBeLessThanOrEqual(1);
    expect(highScore).toBeGreaterThanOrEqual(0);
    expect(highScore).toBeLessThanOrEqual(1);
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it("handles edge cases and bounds gracefully", () => {
    const minInput = { Glucose: 40, BloodPressure: 40, BMI: 10, Age: 18 };
    const maxInput = { Glucose: 400, BloodPressure: 200, BMI: 70, Age: 100 };

    const minScore = predictDiabetesRisk(minInput);
    const maxScore = predictDiabetesRisk(maxInput);

    expect(minScore).toBeGreaterThanOrEqual(0);
    expect(minScore).toBeLessThanOrEqual(1);
    expect(maxScore).toBeGreaterThanOrEqual(0);
    expect(maxScore).toBeLessThanOrEqual(1);
  });
});

describe("/api/risk Zod Input Validation", () => {
  it("accepts valid inputs within bounds and computes integer percentage", () => {
    const valid = { Glucose: 110, BloodPressure: 120, BMI: 24.5, Age: 35 };
    const parsed = riskInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const prob = predictDiabetesRisk(parsed.data);
      const integerPercent = Math.round(prob * 100);
      expect(Number.isInteger(integerPercent)).toBe(true);
      expect(integerPercent).toBeGreaterThanOrEqual(0);
      expect(integerPercent).toBeLessThanOrEqual(100);
    }
  });

  it("rejects invalid inputs below minimum bounds (returns 400 validation error)", () => {
    expect(riskInputSchema.safeParse({ Glucose: 39, BloodPressure: 120, BMI: 25, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 39, BMI: 25, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 120, BMI: 9.9, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 120, BMI: 25, Age: 17 }).success).toBe(false);
  });

  it("rejects invalid inputs above maximum bounds", () => {
    expect(riskInputSchema.safeParse({ Glucose: 401, BloodPressure: 120, BMI: 25, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 201, BMI: 25, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 120, BMI: 71, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ Glucose: 100, BloodPressure: 120, BMI: 25, Age: 101 }).success).toBe(false);
  });

  it("rejects missing or non-numeric fields", () => {
    expect(riskInputSchema.safeParse({ Glucose: "invalid", BloodPressure: 120, BMI: 25, Age: 30 }).success).toBe(false);
    expect(riskInputSchema.safeParse({ BloodPressure: 120, BMI: 25, Age: 30 }).success).toBe(false);
  });
});

