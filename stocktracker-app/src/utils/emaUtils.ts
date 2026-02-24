/**
 * Calculate Exponential Moving Average (EMA)
 * @param prices - Array of price values
 * @param period - EMA period (e.g., 8, 20, 50, 200)
 * @returns EMA value or null if insufficient data
 */
export const calculateEMA = (prices: number[], period: number): number | null => {
  // Input validation
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Period must be a positive integer");
  }
  if (prices.length < period || prices.some(isNaN)) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  // Calculate initial SMA
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  // Calculate EMA for subsequent prices
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }

  return Number(ema.toFixed(4)); // Round to 4 decimal places for precision
}; 