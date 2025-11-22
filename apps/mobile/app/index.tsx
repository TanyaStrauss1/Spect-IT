/**
 * Mobile App - Home Screen
 */

import { View, ScrollView } from 'react-native'
import { Box, Text, VStack, HStack } from 'native-base'
import { MobileButton } from '@spect-it/ui'
import { Link } from 'expo-router'

const tests = [
  { id: 'acuity', title: 'Visual Acuity', icon: '👁️', route: '/tests/acuity' },
  { id: 'color', title: 'Color Vision', icon: '🎨', route: '/tests/color' },
  { id: 'astigmatism', title: 'Astigmatism', icon: '🌀', route: '/tests/astigmatism' },
  { id: 'contrast', title: 'Contrast Sensitivity', icon: '🌓', route: '/tests/contrast' },
  { id: 'visual-field', title: 'Visual Field', icon: '📍', route: '/tests/visual-field' },
  { id: 'prescription', title: 'Prescription', icon: '🔬', route: '/tests/prescription' },
]

export default function HomeScreen() {
  return (
    <ScrollView>
      <Box bg="blue.50" minH="100%">
        {/* Header */}
        <Box bg="white" px={4} py={4} shadow={1}>
          <HStack alignItems="center" space={3}>
            <Text fontSize="3xl">👁️</Text>
            <Text fontSize="2xl" fontWeight="bold" color="#667eea">
              Spect-IT
            </Text>
          </HStack>
        </Box>

        {/* Hero */}
        <Box px={4} py={8} alignItems="center">
          <Box bg="#667eea" px={4} py={2} rounded="full" mb={4}>
            <Text color="white" fontSize="sm" fontWeight="semibold">
              Premium Advanced Eye Testing
            </Text>
          </Box>
          <Text fontSize="3xl" fontWeight="bold" textAlign="center" mb={2}>
            Advanced Eye Testing Platform
          </Text>
          <Text fontSize="lg" color="gray.600" textAlign="center" px={4}>
            AI-powered professional-grade vision assessment
          </Text>
        </Box>

        {/* Test Grid */}
        <Box px={4} pb={8}>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Vision Tests
          </Text>
          <VStack space={4}>
            {tests.map((test) => (
              <Link key={test.id} href={test.route as any}>
                <Box
                  bg="white"
                  p={4}
                  rounded="lg"
                  shadow={2}
                  borderWidth={1}
                  borderColor="gray.200"
                >
                  <HStack alignItems="center" space={4}>
                    <Text fontSize="4xl">{test.icon}</Text>
                    <Box flex={1}>
                      <Text fontSize="lg" fontWeight="semibold">
                        {test.title}
                      </Text>
                    </Box>
                    <Text color="gray.400">→</Text>
                  </HStack>
                </Box>
              </Link>
            ))}
          </VStack>
        </Box>

        {/* Navigation */}
        <Box px={4} pb={8}>
          <VStack space={3}>
            <Link href="/dashboard" asChild>
              <MobileButton variant="outline" w="100%">
                Dashboard
              </MobileButton>
            </Link>
            <Link href="/marketplace" asChild>
              <MobileButton variant="outline" w="100%">
                Marketplace
              </MobileButton>
            </Link>
            <Link href="/specialists" asChild>
              <MobileButton variant="outline" w="100%">
                Find Specialists
              </MobileButton>
            </Link>
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  )
}

