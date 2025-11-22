/**
 * Screening Test Component
 * Example integration using structured ScreeningInput/ScreeningOutput
 */

'use client'

import React, { useState } from "react";
import { useScreeningModel, type ScreeningInput } from "../hooks/useScreeningModel";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@spect-it/ui";
import { LiDARDetector, EyeLandmarkDetector, PupilGeometryExtractor } from "@spect-it/cv";

export function ScreeningTestComponent() {
  const { isLoading, error, predict, modelStatus } = useScreeningModel({
    modelUrl: "/models/screening/model.json",
    modelVersion: "1.0.0",
    backend: "webgl",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<ScreeningInput | null>(null);

  /**
   * Extract structured features from CV modules
   */
  const extractScreeningInput = async (): Promise<ScreeningInput> => {
    // 1. Depth Features (from LiDAR/camera)
    const depthFeatures: number[] = [];
    try {
      const lidar = new LiDARDetector();
      await lidar.initialize();
      const distanceReading = await lidar.getCurrentDistance();
      depthFeatures.push(distanceReading.distance);
      depthFeatures.push(distanceReading.confidence);
      depthFeatures.push(distanceReading.deviceType === 'lidar' ? 1 : 0);
      depthFeatures.push(distanceReading.deviceType === 'truedepth' ? 1 : 0);
      lidar.stop();
    } catch (err) {
      console.warn("LiDAR extraction failed, using defaults:", err);
      depthFeatures.push(2.0, 0.8, 0, 0); // Default values
    }

    // 2. Eye Geometry Features (from landmarks)
    const eyeGeometryFeatures: number[] = [];
    try {
      const eyeDetector = new EyeLandmarkDetector();
      await eyeDetector.initialize();
      
      const video = document.createElement('video');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      eyeDetector.setVideo(video);
      const landmarks = await eyeDetector.detect();
      
      if (landmarks) {
        const extractor = new PupilGeometryExtractor();
        const geometry = extractor.extract(landmarks);
        
        eyeGeometryFeatures.push(geometry.left.diameter);
        eyeGeometryFeatures.push(geometry.right.diameter);
        eyeGeometryFeatures.push(geometry.combined.averageIPD);
        eyeGeometryFeatures.push(geometry.left.cornealCurvature);
        eyeGeometryFeatures.push(geometry.right.cornealCurvature);
        eyeGeometryFeatures.push(geometry.combined.alignment);
      }

      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.warn("Eye geometry extraction failed, using defaults:", err);
      eyeGeometryFeatures.push(4.5, 4.5, 64.0, 7.8, 7.8, 0.0); // Default values
    }

    // 3. Visual Test Features (from completed tests)
    // In real app, these would come from test results stored in Supabase
    const visualTestFeatures: number[] = [
      1.0,  // Visual acuity (normalized 0-1)
      0.9,  // Contrast sensitivity (normalized 0-1)
      0.0,  // Color vision deficiency (0 = normal, 1 = deficient)
      0.0,  // Astigmatism detected (0 = no, 1 = yes)
    ];

    // 4. Device Metadata Features
    const deviceMetaFeatures: number[] = [
      window.devicePixelRatio || 2.0,  // Screen PPI factor
      window.screen.width / 100,        // Screen width (normalized)
      window.screen.height / 100,        // Screen height (normalized)
      1.0,  // Calibration quality (0-1)
    ];

    return {
      depthFeatures,
      eyeGeometryFeatures,
      visualTestFeatures,
      deviceMetaFeatures,
    };
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    setInput(null);

    try {
      // Extract structured input
      const screeningInput = await extractScreeningInput();
      setInput(screeningInput);

      // Run prediction
      const prediction = await predict(screeningInput);
      setResult(prediction);
    } catch (err) {
      console.error("Prediction error:", err);
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
          <CardTitle>Structured Screening Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modelStatus && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Model Version: {modelStatus.modelVersion}</p>
              <p>Backend: {modelStatus.backend}</p>
              <p>Status: {modelStatus.loaded ? "✅ Loaded" : "⏳ Loading"}</p>
            </div>
          )}

          <Button
            onClick={handlePredict}
            disabled={loading || !modelStatus?.loaded}
            className="w-full"
          >
            {loading ? "Running prediction..." : "Run Structured Screening"}
          </Button>

          {input && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Extracted Input Features:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold">Depth Features ({input.depthFeatures.length}):</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(input.depthFeatures.map(f => f.toFixed(3)), null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold">Eye Geometry ({input.eyeGeometryFeatures.length}):</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(input.eyeGeometryFeatures.map(f => f.toFixed(3)), null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold">Visual Tests ({input.visualTestFeatures.length}):</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(input.visualTestFeatures.map(f => f.toFixed(3)), null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold">Device Meta ({input.deviceMetaFeatures.length}):</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(input.deviceMetaFeatures.map(f => f.toFixed(3)), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Prediction Result:</h3>
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
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        Model: {result.metadata.modelVersion} | Backend:{" "}
                        {result.metadata.backend} | Runtime: {result.metadata.runtime}ms
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {result && !result.error && result.rawOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Model Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result.rawOutput.map((v: number) => v.toFixed(4)), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

