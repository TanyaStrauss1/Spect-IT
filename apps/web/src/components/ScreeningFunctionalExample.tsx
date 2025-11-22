/**
 * Functional Screening Model Example
 * Shows the simpler functional API usage
 */

'use client'

import React, { useState } from "react";
import { useScreeningFunctional, type ScreeningInputs } from "../hooks/useScreeningFunctional";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@spect-it/ui";

export function ScreeningFunctionalExample() {
  const { isLoading, error, predict, isLoaded } = useScreeningFunctional({
    modelUrl: "/models/screening/model.json",
    backend: "webgl",
    autoLoad: true,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunScreening = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Prepare inputs (simpler structure - 3 categories instead of 4)
      const inputs: ScreeningInputs = {
        depthFeatures: [2.0, 0.9, 1, 0], // [distance, confidence, lidar_flag, truedepth_flag]
        geometryFeatures: [4.5, 4.5, 64.0, 7.8, 7.8, 0.0], // [left_pupil, right_pupil, ipd, left_corneal, right_corneal, alignment]
        visionTestFeatures: [1.0, 0.9, 0.0, 0.0], // [acuity, contrast, color_deficiency, astigmatism]
      };

      const result = await predict(inputs);
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
          <CardTitle>Functional Screening Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Status: {isLoaded ? "✅ Loaded" : "⏳ Not Loaded"}</p>
          </div>

          <Button
            onClick={handleRunScreening}
            disabled={loading || !isLoaded}
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
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

