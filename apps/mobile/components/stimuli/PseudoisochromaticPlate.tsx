/**
 * React Native Pseudoisochromatic Plate Component
 * 
 * Renders color vision screening plates using react-native-svg
 * Based on @spect-it/cv pseudoisochromatic-plates.ts
 */

import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, ClipPath, G } from 'react-native-svg'
import { generatePlateDots, type PlateConfig } from '@spect-it/cv'

export interface PseudoisochromaticPlateProps {
  config: PlateConfig
  diameter: number
  dotsCount?: number
  style?: any
}

export function PseudoisochromaticPlate({ 
  config, 
  diameter = 300,
  dotsCount = 2000,
  style 
}: PseudoisochromaticPlateProps) {
  const dots = useMemo(
    () => generatePlateDots(config, diameter, dotsCount),
    [config, diameter, dotsCount]
  )
  
  const radius = diameter / 2
  
  return (
    <View style={[styles.container, style]}>
      <Svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
        <Defs>
          <ClipPath id={`plateClip-${config.id}`}>
            <Circle cx={radius} cy={radius} r={radius} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#plateClip-${config.id})`}>
          {dots.map((dot, index) => {
            const cx = dot.x * diameter
            const cy = dot.y * diameter
            const r = dot.radius * diameter
            const fill = `hsl(${dot.hue}, ${dot.saturation}%, ${dot.lightness}%)`
            
            return (
              <Circle
                key={index}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
              />
            )
          })}
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
