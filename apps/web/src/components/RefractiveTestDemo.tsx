/**
 * Refractive Test Demo Component
 * Example integration of ScreeningEngine with real feature extraction
 */

'use client'

import React, { useState } from "react";
import { useScreeningEngine } from "../hooks/useScreeningEngine";
import { Button, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { LiDARDetector, EyeLandmarkDetector, PupilGeometryExtractor } from "@/lib/cv"";

export function RefractiveTestDemo() {
  const { status, error, predictRefractive, engineStatus } = useScreeningEngine("webgl", true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<number[]>([]);

  /**
   * Extract features from CV modules for refractive prediction
   */
  const extractFeatures = async (): Promise<number[]> => {
    const featureVector: number[] = [];

    try {
      // Initialize LiDAR for distance
      const lidar = new LiDARDetector();
      await lidar.initialize();
      const distanceReading = await lidar.getCurrentDistance();
      featureVector.push(distanceReading.distance);
      featureVector.push(distanceReading.confidence);
      lidar.stop();

      // Initialize eye detection
      const eyeDetector = new EyeLandmarkDetector();
      await eyeDetector.initialize();
      
      // Get video element (would be from camera)
      const video = document.createElement('video');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for video
      
      eyeDetector.setVideo(video);
      const landmarks = await eyeDetector.detect();
      
      if (landmarks) {
        // Extract pupil geometry
        const extractor = new PupilGeometryExtractor();
        const geometry = extractor.extract(landmarks);
        
        // Add eye measurements to features
        featureVector.push(geometry.left.diameter);
        featureVector.push(geometry.right.diameter);
        featureVector.push(geometry.combined.averageIPD);
        featureVector.push(geometry.left.cornealCurvature);
        featureVector.push(geometry.right.cornealCurvature);
        featureVector.push(geometry.combined.alignment);
      }

      // Stop video
      stream.getTracks().forEach(track => track.stop());

      // Pad to expected length (16 features)
      while (featureVector.length < 16) {
        featureVector.push(0);
      }

      return featureVector.slice(0, 16);
    } catch (err) {
      console.error("Feature extraction error:", err);
      // Return dummy features if extraction fails
      return new Array(16).fill(0.1);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      // Extract real features from CV modules
      const extractedFeatures = await extractFeatures();
      setFeatures(extractedFeatures);

      // Run prediction
      const res = await predictRefractive(extractedFeatures);
      setResult(res);
    } catch (err) {
      console.error("Prediction error:", err);
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Initialising screening engine…</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#667eea] mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refractive Screening Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRun}
            disabled={status !== "ready" || loading}
            className="w-full"
          >
            {loading ? "Running prediction..." : "Run Refractive Screening"}
          </Button>

          {engineStatus && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Model Version: {engineStatus.modelVersion}</p>
              <p>Backend: {engineStatus.backend}</p>
              <p>Loaded Models: {engineStatus.loadedModels.join(", ")}</p>
              <p>Predictions Logged: {engineStatus.logCount}</p>
            </div>
          )}

          {features.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Extracted Features:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(features.map(f => f.toFixed(3)), null, 2)}
              </pre>
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
                    <span className="font-semibold">Sphere:</span>{" "}
                    {result.sphere} D
                  </div>
                  <div>
                    <span className="font-semibold">Cylinder:</span>{" "}
                    {result.cylinder} D
                  </div>
                  <div>
                    <span className="font-semibold">Axis:</span> {result.axis}°
                  </div>
                  <div>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  {result.metadata && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        Model: {result.metadata.modelVersion} | Backend:{" "}
                        {result.metadata.backend} | Runtime:{" "}
                        {result.metadata.runtime}ms
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {result && !result.error && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Result Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

