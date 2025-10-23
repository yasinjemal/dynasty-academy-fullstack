/**
 * 🔮 PREDICTIVE ANALYTICS
 * Forecast future trends and outcomes
 */

import { prisma } from "@/lib/prisma";
import { saveMetric } from "./analytics-engine";

export interface PredictionInput {
  type: "revenue" | "churn" | "ltv" | "demand" | "growth";
  target?: string;
  horizon: number; // Days into future
  features: Record<string, any>;
}

/**
 * Predict future revenue
 */
export async function predictRevenue(days = 30): Promise<number> {
  // Get historical revenue data
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
      status: "completed",
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  if (orders.length === 0) return 0;

  // Calculate daily revenue
  const dailyRevenue: Record<string, number> = {};
  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total;
  });

  // Calculate average daily revenue
  const avgDailyRevenue =
    Object.values(dailyRevenue).reduce((sum, rev) => sum + rev, 0) /
    Object.keys(dailyRevenue).length;

  // Simple linear extrapolation (would use ML in production)
  const predictedRevenue = avgDailyRevenue * days;

  // Add growth trend
  const recentRevenue = Object.entries(dailyRevenue)
    .slice(-30)
    .reduce((sum, [_, rev]) => sum + rev, 0);
  const olderRevenue = Object.entries(dailyRevenue)
    .slice(0, 30)
    .reduce((sum, [_, rev]) => sum + rev, 0);

  const growthRate = olderRevenue > 0 ? (recentRevenue - olderRevenue) / olderRevenue : 0;

  // Apply growth
  const finalPrediction = predictedRevenue * (1 + growthRate);

  // Save prediction
  await savePrediction({
    type: "revenue",
    horizon: days,
    value: finalPrediction,
    confidence: 0.75, // 75% confidence
    features: {
      avgDailyRevenue,
      growthRate,
      dataPoints: orders.length,
    },
  });

  return Math.round(finalPrediction);
}

/**
 * Predict user growth
 */
export async function predictUserGrowth(days = 30): Promise<number> {
  // Get historical signups
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    select: { createdAt: true },
  });

  if (users.length === 0) return 0;

  // Calculate daily signups
  const dailySignups: Record<string, number> = {};
  users.forEach((user) => {
    const date = user.createdAt.toISOString().split("T")[0];
    dailySignups[date] = (dailySignups[date] || 0) + 1;
  });

  // Calculate average
  const avgDailySignups =
    Object.values(dailySignups).reduce((sum, count) => sum + count, 0) /
    Object.keys(dailySignups).length;

  // Calculate growth rate
  const recent = Object.entries(dailySignups)
    .slice(-30)
    .reduce((sum, [_, count]) => sum + count, 0);
  const older = Object.entries(dailySignups)
    .slice(0, 30)
    .reduce((sum, [_, count]) => sum + count, 0);

  const growthRate = older > 0 ? (recent - older) / older : 0.1;

  // Predict with compound growth
  const predictedGrowth = avgDailySignups * days * (1 + growthRate);

  await savePrediction({
    type: "growth",
    horizon: days,
    value: predictedGrowth,
    confidence: 0.7,
    features: {
      avgDailySignups,
      growthRate,
      dataPoints: users.length,
    },
  });

  return Math.round(predictedGrowth);
}

/**
 * Predict demand for product/course
 */
export async function predictDemand(
  productId: string,
  days = 30
): Promise<number> {
  // Get historical purchases
  const purchases = await prisma.purchase.findMany({
    where: {
      productId,
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    select: { createdAt: true },
  });

  if (purchases.length === 0) return 0;

  // Calculate daily demand
  const dailyDemand: Record<string, number> = {};
  purchases.forEach((p) => {
    const date = p.createdAt.toISOString().split("T")[0];
    dailyDemand[date] = (dailyDemand[date] || 0) + 1;
  });

  const avgDailyDemand =
    Object.values(dailyDemand).reduce((sum, d) => sum + d, 0) /
    Object.keys(dailyDemand).length;

  const predictedDemand = avgDailyDemand * days;

  await savePrediction({
    type: "demand",
    target: productId,
    horizon: days,
    value: predictedDemand,
    confidence: 0.65,
    features: {
      avgDailyDemand,
      dataPoints: purchases.length,
    },
  });

  return Math.round(predictedDemand);
}

/**
 * Forecast metrics for next period
 */
export async function forecastMetrics(
  metricName: string,
  days = 30
): Promise<{ date: string; value: number }[]> {
  // Get historical data
  const metrics = await prisma.metric.findMany({
    where: {
      name: metricName,
      period: "daily",
      date: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: "asc" },
  });

  if (metrics.length < 7) {
    return []; // Not enough data
  }

  // Calculate trend (simple moving average)
  const values = metrics.map((m) => m.value);
  const trend =
    values.slice(-7).reduce((sum, v) => sum + v, 0) / 7 -
    values.slice(0, 7).reduce((sum, v) => sum + v, 0) / 7;

  const lastValue = values[values.length - 1];
  const dailyTrend = trend / metrics.length;

  // Forecast
  const forecast: { date: string; value: number }[] = [];
  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const predictedValue = lastValue + dailyTrend * i;

    forecast.push({
      date: futureDate.toISOString().split("T")[0],
      value: Math.max(0, Math.round(predictedValue)),
    });
  }

  return forecast;
}

/**
 * Calculate prediction accuracy
 */
export async function calculatePredictionAccuracy(type: string): Promise<number> {
  const predictions = await prisma.prediction.findMany({
    where: {
      type,
      actualValue: { not: null },
    },
  });

  if (predictions.length === 0) return 0;

  const accuracies = predictions.map((p) => {
    if (!p.actualValue) return 0;
    const error = Math.abs(p.value - p.actualValue);
    const accuracy = 1 - error / p.actualValue;
    return Math.max(0, accuracy);
  });

  const avgAccuracy =
    accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

  return Math.round(avgAccuracy * 100);
}

/**
 * Save prediction to database
 */
async function savePrediction(data: {
  type: string;
  target?: string;
  horizon: number;
  value: number;
  confidence: number;
  features: Record<string, any>;
  modelVersion?: string;
}) {
  return prisma.prediction.create({
    data: {
      type: data.type,
      target: data.target,
      value: data.value,
      confidence: data.confidence,
      horizon: data.horizon,
      features: data.features as any,
      modelVersion: data.modelVersion || "v1.0",
      predictedAt: new Date(),
    },
  });
}

/**
 * Update prediction with actual value
 */
export async function updatePredictionActual(
  predictionId: string,
  actualValue: number
) {
  const prediction = await prisma.prediction.findUnique({
    where: { id: predictionId },
  });

  if (!prediction) throw new Error("Prediction not found");

  const error = Math.abs(prediction.value - actualValue);
  const accuracy = 1 - error / actualValue;

  return prisma.prediction.update({
    where: { id: predictionId },
    data: {
      actualValue,
      accuracy,
      actualizedAt: new Date(),
    },
  });
}

/**
 * Get anomaly detection for metric
 */
export async function detectAnomalies(
  metricName: string,
  threshold = 2.0 // Standard deviations
): Promise<{ date: Date; value: number; expected: number }[]> {
  const metrics = await prisma.metric.findMany({
    where: {
      name: metricName,
      period: "daily",
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: "asc" },
  });

  if (metrics.length < 7) return [];

  // Calculate mean and std dev
  const values = metrics.map((m) => m.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Find anomalies
  const anomalies: { date: Date; value: number; expected: number }[] = [];

  metrics.forEach((metric) => {
    const zScore = Math.abs((metric.value - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({
        date: metric.date,
        value: metric.value,
        expected: mean,
      });
    }
  });

  return anomalies;
}
