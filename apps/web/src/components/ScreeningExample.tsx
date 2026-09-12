/**
 * Screening Example Component
 * Example integration with screening models
 * 
 * NOTE: This component uses an older API and is currently disabled pending updates.
 */

'use client'

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";

export function ScreeningExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Screening Example</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          This demo component is currently being updated to use the latest screening API.
        </p>
      </CardContent>
    </Card>
  );
}
