/**
 * React Hook for Functional Screening Engine
 * Exact match to specification
 */

import { useEffect, useState } from "react";
import {
  loadScreeningModel,
  runScreening,
  type ScreeningInputs,
  type ScreeningOutputs,
} from "../lib/models/screening/model-functional";

export function useScreeningEngine() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadScreeningModel("/models/screening/model.json");
        setLoading(false);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load screening model");
        setLoading(false);
      }
    })();
  }, []);

  async function screen(inputs: ScreeningInputs): Promise<ScreeningOutputs | null> {
    try {
      return await runScreening(inputs);
    } catch (err: any) {
      setError(err?.message ?? "Screening failed");
      return null;
    }
  }

  return { loading, error, screen };
}
