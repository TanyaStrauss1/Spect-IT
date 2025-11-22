/**
 * React Hook for Functional Screening Model API
 * Simpler functional approach with automatic memory management
 */

import { useEffect, useState, useCallback } from "react";
import {
  initScreeningBackend,
  loadScreeningModel,
  runScreening,
  isModelLoaded,
  type ScreeningInputs,
  type ScreeningOutputs,
  type ScreeningBackend,
} from "@spect-it/models";

type UseScreeningFunctionalOptions = {
  modelUrl: string;
  backend?: ScreeningBackend;
  autoLoad?: boolean; // Auto-load on mount (default: true)
};

type UseScreeningFunctionalResult = {
  isLoading: boolean;
  error: Error | null;
  predict: (inputs: ScreeningInputs) => Promise<ScreeningOutputs>;
  isLoaded: boolean;
};

export function useScreeningFunctional(
  options: UseScreeningFunctionalOptions
): UseScreeningFunctionalResult {
  const { modelUrl, backend = "webgl", autoLoad = true } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!autoLoad) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize backend
        await initScreeningBackend(backend);

        // Load model
        await loadScreeningModel(modelUrl);

        if (!cancelled) {
          setIsLoaded(isModelLoaded());
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const err = e as Error;
          setError(err);
          setIsLoading(false);
          console.error("Failed to initialize screening model:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      // Note: We don't dispose here as the model is shared
      // Call disposeScreeningModel() manually if needed
    };
  }, [modelUrl, backend, autoLoad]);

  const predict = useCallback(
    async (inputs: ScreeningInputs): Promise<ScreeningOutputs> => {
      if (error) {
        throw error;
      }

      if (isLoading) {
        throw new Error("Screening model is still loading");
      }

      try {
        const result = await runScreening(inputs);
        setIsLoaded(isModelLoaded());
        return result;
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      }
    },
    [error, isLoading]
  );

  return { isLoading, error, predict, isLoaded };
}

