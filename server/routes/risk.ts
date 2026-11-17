import { RequestHandler } from "express";
import { z } from "zod";
import { predictDiabetesRisk } from "../ml/riskModel.js";
import { RiskRequest, RiskResponse } from "@shared/api";

export const riskInputSchema = z.object({
  Glucose: z.number().min(40).max(400),
  BloodPressure: z.number().min(40).max(200),
  BMI: z.number().min(10).max(70),
  Age: z.number().min(18).max(100),
});

export const handleRisk: RequestHandler = (req, res) => {
  const parseResult = riskInputSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid input. Glucose must be 40-400, BloodPressure 40-200, BMI 10-70, Age 18-100.",
      details: parseResult.error.flatten(),
    });
    return;
  }

  const data = parseResult.data;
  const input: RiskRequest = {
    Glucose: Number(data.Glucose),
    BloodPressure: Number(data.BloodPressure),
    BMI: Number(data.BMI),
    Age: Number(data.Age),
  };
  const probability = predictDiabetesRisk(input);
  const diabetesRisk = Math.round(probability * 100);

  const response: RiskResponse = { diabetesRisk };
  res.json(response);
};

