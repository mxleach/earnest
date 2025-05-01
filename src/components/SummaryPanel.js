// src/components/SummaryPanel.js
import React from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  Heading,
  HStack,
} from '@chakra-ui/react';

function SummaryPanel({
  weekData,
  selectedDayIndex,
  setSelectedDayIndex,
  calculateDailyTotal,
  clearAllData,
}) {
  const weeklyTotal = weekData.reduce(
    (sum, day) => sum + calculateDailyTotal(day),
    0
  );

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      overflow="hidden"
      borderTop="4px solid"
      borderTopColor="brand.mint"
    >
      <HStack justifyContent="space-between" mb={2}>
        <Heading size="sm" color="brand.mint">
          Summary of Days
        </Heading>
        <Text color="brand.peach" fontWeight="semibold">
          Total: {weeklyTotal.toFixed(2)} hrs
        </Text>
      </HStack>

      <VStack spacing={2} align="stretch">
        {weekData.map((day, index) => (
          <Box
            key={day.date}
            p={2}
            borderRadius="md"
            bg={index === selectedDayIndex ? 'brand.mint' : 'gray.50'}
            color={index === selectedDayIndex ? 'white' : 'black'}
            cursor="pointer"
            onClick={() => setSelectedDayIndex(index)}
          >
            <Text fontWeight="bold">{day.day}</Text>
            <Text fontSize="sm" opacity={0.8}>{day.date}</Text>
            <Text fontSize="sm" fontWeight="medium">
              {calculateDailyTotal(day).toFixed(2)} hrs
            </Text>
          </Box>
        ))}
      </VStack>

      <Button
        mt={4}
        size="sm"
        variant="outline"
        colorScheme="teal"
        onClick={clearAllData}
      >
        Clear All
      </Button>
    </Box>
  );
}

export default SummaryPanel;
