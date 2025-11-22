/**
 * React Hook for ScreeningModel
 * Provides typed access to structured screening model
 */

import { useEffect, useMemo, useState } from "react";
import { ScreeningInput, ScreeningModel, ScreeningOutput } from "../lib/models/screening/screening-model";

type UseScreeningModelOptions = {
  modelUrl: string;
  modelVersion?: string;  // Optional: defaults to "1.0.0"
  backend?: "webgl" | "wasm" | "cpu";  // Optional: defaults to "webgl"
};

type UseScreeningModelResult = {
  isLoading: boolean;
  error: Error | null;
  predict: (input: ScreeningInput) => Promise<ScreeningOutput>;
  modelStatus?: {  // Optional: for debugging/monitoring
    loaded: boolean;
    modelUrl: string;
    modelVersion: string;
    backend: string;
  };
};

export function useScreeningModel(
  options: UseScreeningModelOptions
): UseScreeningModelResult {
  const { modelUrl, modelVersion = "1.0.0", backend = "webgl" } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [modelStatus, setModelStatus] = useState<any>(null);

  const model = useMemo(
    () => new ScreeningModel(modelUrl, modelVersion, backend),
    [modelUrl, modelVersion, backend]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        await model.load();
        
        if (!cancelled) {
          setModelStatus(model.getStatus());
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const err = e as Error;
          setError(err);
          setIsLoading(false);
          console.error("Failed to load screening model:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      model.dispose();
    };
  }, [model]);

  const predict = async (input: ScreeningInput): Promise<ScreeningOutput> => {
    if (error) {
      throw error;
    }

    if (isLoading) {
      throw new Error("Model is still loading");
    }

    try {
      const result = await model.predict(input);
      setModelStatus(model.getStatus());
      return result;
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    }
  };

  return { isLoading, error, predict, modelStatus };
}

