// DayEditor.js — Handles time tracking input for each day
// Supports manual totals, presets like "Now" or "9–5", and copying previous day

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import TimeSelector from '../TimeSelector';

function DayEditor({
  dayData,
  dayIndex,
  updateBlock,
  addBlock,
  removeBlock,
  weekData = [],
  setWeekData = () => {},
}) {
  const { day, timeBlocks } = dayData;
  const [weeklyGoal, setWeeklyGoal] = useState('40');
  const [manualTotal, setManualTotal] = useState(dayData.manualTotal || '');
  const [manualMode, setManualMode] = useState(!!dayData.manualMode);

  // Change handlers for time input
  const handleTimeInChange = (blockIndex, newVal) => {
    updateBlock(dayIndex, blockIndex, newVal, timeBlocks[blockIndex].timeOut);
  };

  const handleTimeOutChange = (blockIndex, newVal) => {
    updateBlock(dayIndex, blockIndex, timeBlocks[blockIndex].timeIn, newVal);
  };

  const copyPreviousDay = () => {
    if (dayIndex === 0 || !weekData[dayIndex - 1]) return;
    const previousBlocks = weekData[dayIndex - 1].timeBlocks;
    if (!Array.isArray(previousBlocks)) return;

    const copied = previousBlocks.map(block => ({ ...block }));
    setWeekData(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeBlocks: copied,
        manualMode: false,
        manualTotal: '',
      };
      return updated;
    });
  };

  const handlePreset = (type) => {
    let timeIn = '', timeOut = '';
    if (type === 'now') {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeIn = `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    } else if (type === '9to5') {
      timeIn = '9:00 AM';
      timeOut = '5:00 PM';
    }

    setWeekData(prev => {
      const updated = [...prev];
      updated[dayIndex].timeBlocks = [{ timeIn, timeOut }];
      updated[dayIndex].manualMode = false;
      updated[dayIndex].manualTotal = '';
      return updated;
    });
  };

  // Daily hours calculator (used for weekly total)
  const calculateDailyTotal = (day) => {
    const parseTime = (str) => {
      const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return null;
      let [, h, m, period] = match;
      h = parseInt(h);
      m = parseInt(m);
      if (period.toUpperCase() === 'PM' && h < 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    if (day.manualMode && day.manualTotal) {
      return parseFloat(day.manualTotal);
    }

    return day.timeBlocks.reduce((sum, block) => {
      const start = parseTime(block.timeIn);
      const end = parseTime(block.timeOut);
      if (start === null || end === null) return sum;
      let diff = end - start;
      if (diff < 0) diff += 24 * 60;
      return sum + diff / 60;
    }, 0);
  };

  const calculateWeeklyTotal = () => {
    return weekData.reduce((sum, day) => sum + calculateDailyTotal(day), 0);
  };

  const hoursRemaining = Math.max(0, Number(weeklyGoal || 0) - calculateWeeklyTotal());

  useEffect(() => {
    setWeekData(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        manualTotal,
        manualMode,
      };
      return updated;
    });
  }, [manualTotal, manualMode]);

  useEffect(() => {
    setManualMode(dayData.manualMode || false);
    setManualTotal(dayData.manualTotal || '');
  }, [dayData]);

  const isDayEmpty =
    !manualMode &&
    (timeBlocks.length === 0 ||
      (timeBlocks.length === 1 && !timeBlocks[0].timeIn && !timeBlocks[0].timeOut));

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      overflow="visible"
      position="relative"
      zIndex={0}
      borderTop="4px solid"
      borderTopColor="brand.mint"
    >
      <Heading size="md" mb={2} color="brand.mint">
        Hours for {day}
      </Heading>

      <HStack mb={2} alignItems="center" flexWrap="wrap">
        <Text fontSize="sm" color="gray.600">Weekly Goal:</Text>
        <InputGroup size="sm" width="100px">
          <Input
            type="number"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(e.target.value)}
            borderColor="brand.mint"
            focusBorderColor="brand.peach"
            placeholder="40"
          />
          <InputRightAddon>hrs</InputRightAddon>
        </InputGroup>
        <Text fontSize="sm" color="gray.600">
          Remaining: {hoursRemaining.toFixed(2)} hrs
        </Text>
      </HStack>

      <VStack spacing={4} align="stretch">
        {manualMode ? (
          <InputGroup size="sm" width="140px">
            <Input
              placeholder="Total hours"
              type="number"
              value={manualTotal}
              onChange={(e) => setManualTotal(e.target.value)}
              borderColor="brand.peach"
              focusBorderColor="brand.mint"
            />
            <InputRightAddon>hrs</InputRightAddon>
          </InputGroup>
        ) : (
          <>
            {timeBlocks.map((block, index) => (
              <HStack key={index} spacing={3} align="flex-end">
                <Box flex={1} position="relative" zIndex={1}>
                  <Text fontSize="sm">Time In</Text>
                  <TimeSelector
                    key={`${dayIndex}-${index}-in`}
                    value={block.timeIn}
                    onChange={(val) => handleTimeInChange(index, val)}
                  />
                </Box>
                <Box flex={1} position="relative" zIndex={1}>
                  <Text fontSize="sm">Time Out</Text>
                  <TimeSelector
                    key={`${dayIndex}-${index}-out`}
                    value={block.timeOut}
                    onChange={(val) => handleTimeOutChange(index, val)}
                  />
                </Box>
                {timeBlocks.length > 1 && (
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    mt={4}
                    aria-label="Remove time block"
                    onClick={() => removeBlock(dayIndex, index)}
                  />
                )}
              </HStack>
            ))}
            {isDayEmpty && (
              <Text fontSize="sm" color="gray.500">
                Your day’s still open. Add your first block of time to begin.
              </Text>
            )}
          </>
        )}

        {/* Action row */}
        <HStack zIndex={1} position="relative" wrap="wrap" spacing={2}>
          <Button
            onClick={() => addBlock(dayIndex)}
            size="sm"
            bg="brand.mint"
            color="white"
            _hover={{ bg: 'brand.peach', color: 'black' }}
          >
            Add Block
          </Button>

          {dayIndex > 0 && (
            <Button
              onClick={copyPreviousDay}
              size="sm"
              variant="outline"
              colorScheme="gray"
            >
              Copy Previous Day
            </Button>
          )}

          <Button onClick={() => handlePreset('now')} size="sm" variant="ghost">
            Now
          </Button>
          <Button onClick={() => handlePreset('9to5')} size="sm" variant="ghost">
            9–5
          </Button>

          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="manual-switch" mb="0" fontSize="xs" fontWeight="medium">
              Manual Input
            </FormLabel>
            <Switch
              id="manual-switch"
              isChecked={manualMode}
              onChange={() => setManualMode(!manualMode)}
              size="sm"
            />
          </FormControl>
        </HStack>
      </VStack>
    </Box>
  );
}

export default DayEditor;
