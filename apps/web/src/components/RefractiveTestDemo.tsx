/**
 * Refractive Test Demo Component
 * Example integration of ScreeningEngine with real feature extraction
 * 
 * NOTE: This component uses an older API and is currently disabled pending updates.
 */

'use client'

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";

export function RefractiveTestDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Refractive Screening Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          This demo component is currently being updated to use the latest screening API.
        </p>
      </CardContent>
    </Card>
  );
}
