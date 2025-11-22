/**
 * Complete Example: ScreeningModel Usage in React Component
 * Shows exact usage pattern as specified
 */

'use client'

import React, { useState } from "react";
import { useScreeningModel, type ScreeningInput } from "../hooks/useScreeningModel";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../components/ui";

export function ScreeningExample() {
  const { isLoading, error, predict } = useScreeningModel({
    modelUrl: "/models/screening/model.json",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunScreening = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Extract features from your CV modules and test results
      // This is a simplified example - in production, extract from actual modules
      
      const depthVector = [2.0, 0.9, 1, 0]; // [distance, confidence, lidar_flag, truedepth_flag]
      const eyeGeomFeatures = [4.5, 4.5, 64.0, 7.8, 7.8, 0.0]; // [left_pupil, right_pupil, ipd, left_corneal, right_corneal, alignment]
      const visualScores = [1.0, 0.9, 0.0, 0.0]; // [acuity, contrast, color_deficiency, astigmatism]
      const deviceFeatures = [2.0, 19.2, 10.8, 1.0]; // [pixel_ratio, screen_width, screen_height, calibration_quality]

      const input: ScreeningInput = {
        depthFeatures: depthVector,
        eyeGeometryFeatures: eyeGeomFeatures,
        visualTestFeatures: visualScores,
        deviceMetaFeatures: deviceFeatures,
      };

      const result = await predict(input);
      console.log(result);
      setResult(result);
    } catch (err) {
      console.error("Screening error:", err);
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading screening model…</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#667eea] mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-red-600">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Screening Model Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRunScreening}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Running screening..." : "Run Screening"}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Screening Result:</h3>
              {result.error ? (
                <p className="text-red-600">{result.error}</p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Sphere:</span> {result.sphere} D
                  </div>
                  <div>
                    <span className="font-semibold">Cylinder:</span> {result.cylinder} D
                  </div>
                  <div>
                    <span className="font-semibold">Axis:</span> {result.axis}°
                  </div>
                  <div>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  
                  {result.qualityFlags && result.qualityFlags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="font-semibold text-sm mb-1">Quality Flags:</p>
                      <ul className="list-disc list-inside text-sm">
                        {result.qualityFlags.map((flag: string, i: number) => (
                          <li key={i} className="text-yellow-700">{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
                      <p>Model: {result.metadata.modelVersion}</p>
                      <p>Backend: {result.metadata.backend}</p>
                      <p>Runtime: {result.metadata.runtime}ms</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

