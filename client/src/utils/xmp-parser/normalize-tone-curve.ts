export interface NormalizedToneCurvePoint {
  x: number;
  y: number;
}

const CHART_INPUT_POINTS = [0, 64, 128, 192, 255];

export function normalizeToneCurve(
  curveData: readonly NormalizedToneCurvePoint[] | null | undefined,
  mode: "sampled"
): number[];
export function normalizeToneCurve(
  curveData: readonly NormalizedToneCurvePoint[] | null | undefined,
  mode: "points"
): NormalizedToneCurvePoint[] | undefined;
export function normalizeToneCurve(
  curveData: readonly NormalizedToneCurvePoint[] | null | undefined,
  mode: "sampled" | "points"
): number[] | NormalizedToneCurvePoint[] | undefined {
  if (mode === "points") {
    if (!curveData || !Array.isArray(curveData)) return undefined;
    return curveData.map(({ x, y }) => ({ x, y }));
  }

  if (!curveData) return [...CHART_INPUT_POINTS];

  return CHART_INPUT_POINTS.map((input) => {
    const lowerPoint = curveData.reduce<NormalizedToneCurvePoint | undefined>(
      (previous, current) => {
        return current.x <= input && (!previous || current.x > previous.x)
          ? current
          : previous;
      },
      undefined
    );
    const upperPoint = curveData.reduce<NormalizedToneCurvePoint | undefined>(
      (previous, current) => {
        return current.x >= input && (!previous || current.x < previous.x)
          ? current
          : previous;
      },
      undefined
    );

    if (!lowerPoint || !upperPoint) return input;
    if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

    const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
    return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
  });
}
