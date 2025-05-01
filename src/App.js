// App.js — Main layout and logic for the Earnest planner app
// Manages auth state, weekly timesheet, and integrates all key tools

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useColorModeValue,
  HStack,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  FiClock,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiMoreVertical,
} from 'react-icons/fi';

import theme from './theme';
import { useAuth } from './contexts/AuthContext';

import AuthForm from './components/AuthForm';
import SummaryPanel from './components/SummaryPanel';
import DayEditor from './components/DayEditor';
import NetPayCalculator from './components/NetPayCalculator';
import BudgetCalculator from './components/BudgetCalculator';
import SavingsGoalCalculator from './components/SavingsGoalCalculator';

// Converts time strings like "9:30 AM" into total minutes
function calculateDailyTotal(day) {
  const parseTime = (str) => {
    const match = str.match(/(\d{1,2})[:\s]?(\d{2})\s*(AM|PM|am|pm)?/);
    if (!match) return null;

    let [, h, m, period] = match;
    h = parseInt(h);
    m = parseInt(m);

    if (period) {
      if (period.toUpperCase() === 'PM' && h < 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    }

    return h * 60 + m;
  };

  if (day.manualMode && day.manualTotal) {
    return parseFloat(day.manualTotal) || 0;
  }

  return day.timeBlocks.reduce((acc, block) => {
    const start = parseTime(block.timeIn);
    const end = parseTime(block.timeOut);
    if (start === null || end === null) return acc;
    let diff = end - start;
    if (diff < 0) diff += 24 * 60; // handles overnight hours
    return acc + diff / 60;
  }, 0);
}

// Generates a fresh week object with default structure
function getCurrentWeek() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.map((day, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      day,
      date: date.toISOString().split('T')[0],
      timeBlocks: [{ timeIn: '', timeOut: '' }],
      manualMode: false,
      manualTotal: '',
    };
  });
}

// Basic localStorage helpers
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

const loadFromLocalStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const { user, loading, signOut } = useAuth();

  // Colors for tab states (must be called before any returns)
  const tabBg = useColorModeValue('white', 'gray.800');
  const selectedTabBg = useColorModeValue('brand.mint', 'brand.charcoal');
  const selectedTabColor = useColorModeValue('brand.charcoal', 'white');

  // State hooks for all primary app data
  const [weekData, setWeekData] = useState(() => loadFromLocalStorage('weekData', getCurrentWeek()));
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => loadFromLocalStorage('selectedDayIndex', 0));
  const [netPayEstimate, setNetPayEstimate] = useState(() => loadFromLocalStorage('netPayEstimate', null));

  const calculateDailyTotalMemo = useMemo(() => (day) => calculateDailyTotal(day), []);

  // Keep data persistent across refreshes
  useEffect(() => {
    saveToLocalStorage('weekData', weekData);
    saveToLocalStorage('selectedDayIndex', selectedDayIndex);
    saveToLocalStorage('netPayEstimate', netPayEstimate);
  }, [weekData, selectedDayIndex, netPayEstimate]);

  // Show login or loading screen if needed
  if (loading) return <p>Loading session...</p>;
  if (!user) return <AuthForm />;

  // Update one time block in a specific day
  const updateBlock = (dayIndex, blockIndex, timeIn, timeOut) => {
    setWeekData(prev => {
      const updated = [...prev];
      const blocks = [...updated[dayIndex].timeBlocks];
      blocks[blockIndex] = { timeIn, timeOut };
      updated[dayIndex].timeBlocks = blocks;
      return updated;
    });
  };

  const addBlock = (dayIndex) => {
    setWeekData(prev => {
      const updated = [...prev];
      updated[dayIndex].timeBlocks.push({ timeIn: '', timeOut: '' });
      return updated;
    });
  };

  const removeBlock = (dayIndex, blockIndex) => {
    setWeekData(prev => {
      const updated = [...prev];
      updated[dayIndex].timeBlocks.splice(blockIndex, 1);
      return updated;
    });
  };

  const clearAllData = () => {
    setWeekData(prev =>
      prev.map(day => ({ ...day, timeBlocks: [{ timeIn: '', timeOut: '' }], manualMode: false, manualTotal: '' }))
    );
  };

  // Useful for debug/dev reset
  const resetAllData = () => {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      localStorage.clear();
      setWeekData(getCurrentWeek());
      setSelectedDayIndex(0);
      setNetPayEstimate(null);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Box bg="transparent" minH="100vh" p={4}>
        <Heading textAlign="center" mb={6} color="brand.charcoal">Earnest</Heading>
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={-4} mb={6}>
          Plan purposefully. Live earnestly.
        </Text>

        <Tabs variant="soft-rounded" colorScheme="brand" size="md" isFitted mb={4}>
          <TabList mb={4} bg={tabBg} borderRadius="full" p={1.5} boxShadow="sm">
            <Tab _selected={{ bg: selectedTabBg, color: selectedTabColor, fontWeight: 'medium' }} borderRadius="full">
              <HStack spacing={2}><Icon as={FiClock} /><Text>Timesheet</Text></HStack>
            </Tab>
            <Tab _selected={{ bg: selectedTabBg, color: selectedTabColor, fontWeight: 'medium' }} borderRadius="full">
              <HStack spacing={2}><Icon as={FiDollarSign} /><Text>Pay Calculator</Text></HStack>
            </Tab>
            <Tab _selected={{ bg: selectedTabBg, color: selectedTabColor, fontWeight: 'medium' }} borderRadius="full">
              <HStack spacing={2}><Icon as={FiPieChart} /><Text>Budget Planner</Text></HStack>
            </Tab>
            <Tab _selected={{ bg: selectedTabBg, color: selectedTabColor, fontWeight: 'medium' }} borderRadius="full">
              <HStack spacing={2}><Icon as={FiTarget} /><Text>Savings Goals</Text></HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Grid templateColumns={["1fr", null, "300px 1fr"]} gap={6}>
                <SummaryPanel
                  weekData={weekData}
                  selectedDayIndex={selectedDayIndex}
                  setSelectedDayIndex={setSelectedDayIndex}
                  calculateDailyTotal={calculateDailyTotalMemo}
                  clearAllData={clearAllData}
                />

                <Box>
                  <DayEditor
                    dayData={weekData[selectedDayIndex]}
                    dayIndex={selectedDayIndex}
                    updateBlock={updateBlock}
                    addBlock={addBlock}
                    removeBlock={removeBlock}
                    weekData={weekData}
                    setWeekData={setWeekData}
                    calculateDailyTotal={calculateDailyTotalMemo}
                  />

                  {netPayEstimate !== null && (
                    <Box mt={4} p={3} bg="white" borderRadius="md" boxShadow="sm">
                      <Text fontSize="md" color="brand.peach" fontWeight="bold">
                        Estimated Net Pay for Week: ${netPayEstimate.toFixed(2)}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Grid>
            </TabPanel>

            <TabPanel p={0}><NetPayCalculator onNetPayCalculated={setNetPayEstimate} /></TabPanel>
            <TabPanel p={0}><BudgetCalculator /></TabPanel>
            <TabPanel p={0}><SavingsGoalCalculator /></TabPanel>
          </TabPanels>
        </Tabs>

        {/* Settings and sign out */}
        <HStack position="absolute" top={4} right={4} spacing={2} zIndex="999">
          <Button onClick={signOut} size="sm" variant="outline" colorScheme="red" borderRadius="full">
            Sign Out
          </Button>
          <Menu>
            <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" aria-label="More options" />
            <MenuList>
              <MenuItem onClick={() => alert('Your data is saved in the browser.')}>Data is Auto-Saved</MenuItem>
              <MenuItem onClick={resetAllData} color="red">Reset All Data</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
