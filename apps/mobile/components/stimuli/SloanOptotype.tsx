/**
 * React Native Sloan Optotype Component
 * 
 * Renders clinical-grade Sloan letters using react-native-svg
 * Based on @spect-it/cv sloan-optotypes.ts geometry
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import type { SloanLetter } from '@spect-it/cv'
import { SLOAN_GEOMETRIES, generateSloanSVGPath } from '@spect-it/cv'

export interface SloanOptotypeProps {
  letter: SloanLetter
  strokeWidthPx: number
  color?: string
  style?: any
}

export function SloanOptotype({ 
  letter, 
  strokeWidthPx, 
  color = '#000000',
  style 
}: SloanOptotypeProps) {
  // Letter is 5 grid units, where 1 unit = stroke width
  const totalSize = strokeWidthPx * 5
  const path = generateSloanSVGPath(letter, strokeWidthPx)
  
  return (
    <View style={[styles.container, style]}>
      <Svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
        <Path d={path} fill={color} />
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

/**
 * Render multiple Sloan letters in a line (for ETDRS)
 */
export interface SloanLineProp {
  letters: SloanLetter[]
  strokeWidthPx: number
  spacing?: number
  color?: string
  style?: any
}

export function SloanLine({ 
  letters, 
  strokeWidthPx, 
  spacing = 1, 
  color = '#000000',
  style 
}: SloanLineProp) {
  return (
    <View style={[styles.lineContainer, style]}>
      {letters.map((letter, index) => (
        <View 
          key={index}
          style={{ marginHorizontal: strokeWidthPx * spacing * 0.5 }}
        >
          <SloanOptotype 
            letter={letter} 
            strokeWidthPx={strokeWidthPx} 
            color={color} 
          />
        </View>
      ))}
    </View>
  )
}

const lineStyles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

Object.assign(styles, lineStyles)
