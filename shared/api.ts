/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface RiskRequest {
  [key: string]: number;
  Glucose: number;
  BloodPressure: number;
  BMI: number;
  Age: number;
}

export interface RiskResponse {
  diabetesRisk: number;
}

