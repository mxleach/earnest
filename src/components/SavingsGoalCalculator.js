// src/components/SavingsGoalCalculator.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  FormControl,
  FormLabel,
  Divider,
  Flex,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiDollarSign, FiCalendar, FiTarget } from 'react-icons/fi';

function SavingsGoalCalculator() {
  // Goal Settings
  const [goalName, setGoalName] = useState('My Savings Goal');
  const [targetAmount, setTargetAmount] = useState(10000);
  const [targetDate, setTargetDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [currentSavings, setCurrentSavings] = useState(0);
  
  // Contribution Settings
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [interestRate, setInterestRate] = useState(2.0);
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly');

  // Results
  const [targetMonthlyContribution, setTargetMonthlyContribution] = useState(0);
  const [projectedSavings, setProjectedSavings] = useState(0);
  const [monthsToGoal, setMonthsToGoal] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Formatting helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate months between current date and target date
  const calculateMonthsBetween = () => {
    const today = new Date();
    const target = new Date(targetDate);
    
    const monthsDiff = (target.getFullYear() - today.getFullYear()) * 12 + 
                      (target.getMonth() - today.getMonth());
    
    return Math.max(0, monthsDiff);
  };

  // Calculate required monthly contribution to reach goal
  const calculateRequiredContribution = () => {
    const months = calculateMonthsBetween();
    
    if (months === 0) {
      return targetAmount - currentSavings > 0 ? targetAmount - currentSavings : 0;
    }
    
    // Simple calculation (without interest)
    const amountNeeded = targetAmount - currentSavings - initialDeposit;
    return amountNeeded > 0 ? amountNeeded / months : 0;
  };

  // Calculate projected savings based on current contribution rate
  const calculateProjectedSavings = () => {
    const months = calculateMonthsBetween();
    
    if (months === 0) {
      return currentSavings + initialDeposit;
    }
    
    // Convert annual interest rate to appropriate period based on compounding frequency
    let periodicRate;
    let periodsPerMonth;
    
    switch (compoundingFrequency) {
      case 'daily':
        periodicRate = interestRate / 100 / 365;
        periodsPerMonth = 30; // approximation
        break;
      case 'weekly':
        periodicRate = interestRate / 100 / 52;
        periodsPerMonth = 4.33; // approximation
        break;
      case 'monthly':
        periodicRate = interestRate / 100 / 12;
        periodsPerMonth = 1;
        break;
      case 'quarterly':
        periodicRate = interestRate / 100 / 4;
        periodsPerMonth = 1/3;
        break;
      case 'annually':
        periodicRate = interestRate / 100;
        periodsPerMonth = 1/12;
        break;
      default:
        periodicRate = interestRate / 100 / 12;
        periodsPerMonth = 1;
    }
    
    // Calculate with compound interest
    let futureValue = currentSavings + initialDeposit;
    
    // For each month
    for (let i = 0; i < months; i++) {
      // For each compounding period in this month
      for (let j = 0; j < periodsPerMonth; j++) {
        futureValue = futureValue * (1 + periodicRate);
      }
      
      // Add monthly contribution
      futureValue += monthlyContribution;
    }
    
    return futureValue;
  };

  // Calculate months until goal is reached with current contribution rate
  const calculateMonthsToGoal = () => {
    // If already reached
    if (currentSavings + initialDeposit >= targetAmount) {
      return 0;
    }
    
    // If no contribution
    if (monthlyContribution <= 0 && interestRate <= 0) {
      return Infinity;
    }
    
    // Convert annual interest rate to appropriate period
    const monthlyRate = interestRate / 100 / 12;
    
    let futureValue = currentSavings + initialDeposit;
    let months = 0;
    
    // Calculate months until goal is reached
    while (futureValue < targetAmount && months < 1200) { // 100 years max
      futureValue = futureValue * (1 + monthlyRate) + monthlyContribution;
      months++;
    }
    
    return months < 1200 ? months : Infinity;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const currentAmount = currentSavings + initialDeposit;
    return (currentAmount / targetAmount) * 100;
  };

  // Update calculations when inputs change
  useEffect(() => {
    setTargetMonthlyContribution(calculateRequiredContribution());
    setProjectedSavings(calculateProjectedSavings());
    setMonthsToGoal(calculateMonthsToGoal());
    setProgressPercentage(calculateProgress());
  }, [
    targetAmount,
    targetDate,
    currentSavings,
    initialDeposit,
    monthlyContribution,
    interestRate,
    compoundingFrequency
  ]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Box>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          {/* Goal Settings */}
          <Card mb={6} bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
            <CardHeader bg="brand.mint" py={3}>
              <Heading size="md" color="brand.charcoal">Goal Settings</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="medium">Goal Name</FormLabel>
                  <Input 
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    borderColor="gray.300"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Target Amount ($)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                    <NumberInput 
                      value={targetAmount} 
                      onChange={(valueString) => setTargetAmount(parseFloat(valueString) || 0)}
                      min={0}
                      precision={2}
                      step={100}
                      w="100%"
                    >
                      <NumberInputField pl="8" borderColor="gray.300" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Target Date</FormLabel>
                  <Input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    borderColor="gray.300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Current Savings ($)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                    <NumberInput 
                      value={currentSavings} 
                      onChange={(valueString) => setCurrentSavings(parseFloat(valueString) || 0)}
                      min={0}
                      precision={2}
                      step={100}
                      w="100%"
                    >
                      <NumberInputField pl="8" borderColor="gray.300" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Contribution Settings */}
          <Card bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
            <CardHeader bg="brand.mint" py={3}>
              <Heading size="md" color="brand.charcoal">Contribution Settings</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="medium">Initial Deposit ($)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                    <NumberInput 
                      value={initialDeposit} 
                      onChange={(valueString) => setInitialDeposit(parseFloat(valueString) || 0)}
                      min={0}
                      precision={2}
                      step={100}
                      w="100%"
                    >
                      <NumberInputField pl="8" borderColor="gray.300" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Monthly Contribution ($)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                    <NumberInput 
                      value={monthlyContribution} 
                      onChange={(valueString) => setMonthlyContribution(parseFloat(valueString) || 0)}
                      min={0}
                      precision={2}
                      step={10}
                      w="100%"
                    >
                      <NumberInputField pl="8" borderColor="gray.300" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Interest Rate (% Annual)</FormLabel>
                  <HStack>
                    <Slider
                      value={interestRate}
                      onChange={(v) => setInterestRate(v)}
                      min={0}
                      max={12}
                      step={0.1}
                      flex="1"
                      focusThumbOnChange={false}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack bg="brand.persianGreen" />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                    <NumberInput
                      value={interestRate}
                      onChange={(valueString) => setInterestRate(parseFloat(valueString) || 0)}
                      min={0}
                      max={100}
                      precision={2}
                      step={0.1}
                      maxW="100px"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text>%</Text>
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Compounding Frequency</FormLabel>
                  <Select 
                    value={compoundingFrequency} 
                    onChange={(e) => setCompoundingFrequency(e.target.value)}
                    borderColor="gray.300"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          {/* Results */}
          <Card bg="white" borderRadius="md" boxShadow="md" overflow="hidden" mb={6}>
            <CardHeader bg="brand.peach" py={3}>
              <Heading size="md" color="brand.charcoal">Results for {goalName}</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>Progress to Goal</Text>
                  <Progress 
                    value={progressPercentage} 
                    height="24px" 
                    colorScheme="green"
                    borderRadius="md" 
                    hasStripe
                  />
                  <Flex justify="space-between" mt={1}>
                    <Text fontSize="sm">{formatCurrency(currentSavings + initialDeposit)}</Text>
                    <Text fontSize="sm">{progressPercentage.toFixed(1)}%</Text>
                    <Text fontSize="sm">{formatCurrency(targetAmount)}</Text>
                  </Flex>
                </Box>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Stat>
                    <StatLabel>Required Monthly</StatLabel>
                    <StatNumber color="brand.persianGreen" fontSize="2xl">
                      {formatCurrency(targetMonthlyContribution)}
                    </StatNumber>
                    <StatHelpText>To reach goal on time</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Projected Final</StatLabel>
                    <StatNumber color="brand.saffron" fontSize="2xl">
                      {formatCurrency(projectedSavings)}
                    </StatNumber>
                    <StatHelpText>With current contributions</StatHelpText>
                  </Stat>
                </Grid>
                
                <Divider />
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="medium">Time to Target Date</Text>
                    <Text fontSize="lg">
                      {calculateMonthsBetween()} {calculateMonthsBetween() === 1 ? 'month' : 'months'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      By {formatDate(targetDate)}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium">Estimated Time to Goal</Text>
                    <Text fontSize="lg">
                      {monthsToGoal === Infinity ? 'Never' : 
                        `${monthsToGoal} ${monthsToGoal === 1 ? 'month' : 'months'}`}
                    </Text>
                    {monthsToGoal !== Infinity && monthsToGoal > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        {monthsToGoal <= calculateMonthsBetween() 
                          ? 'On track!'
                          : `${monthsToGoal - calculateMonthsBetween()} months behind schedule`}
                      </Text>
                    )}
                  </Box>
                </Grid>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Effect of Interest Rate</Text>
                  <Text fontSize="sm" mb={4}>
                    With a {interestRate}% annual interest rate compounded {compoundingFrequency}, 
                    your savings will grow by approximately:
                  </Text>
                  
                  <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                    <Stat size="sm" bg="gray.50" p={2} borderRadius="md">
                      <StatLabel>Monthly</StatLabel>
                      <StatNumber fontSize="md">
                        {formatCurrency((currentSavings + initialDeposit) * (interestRate / 100 / 12))}
                      </StatNumber>
                    </Stat>
                    
                    <Stat size="sm" bg="gray.50" p={2} borderRadius="md">
                      <StatLabel>Yearly</StatLabel>
                      <StatNumber fontSize="md">
                        {formatCurrency((currentSavings + initialDeposit) * (interestRate / 100))}
                      </StatNumber>
                    </Stat>
                    
                    <Stat size="sm" bg="gray.50" p={2} borderRadius="md">
                      <StatLabel>Goal Period</StatLabel>
                      <StatNumber fontSize="md">
                        {formatCurrency(projectedSavings - (currentSavings + initialDeposit + (monthlyContribution * calculateMonthsBetween())))}
                      </StatNumber>
                    </Stat>
                  </Grid>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="medium">Recommendations</Text>
                  
                  {monthsToGoal === Infinity ? (
                    <Text color="red.500" mt={2}>
                      You need to increase your monthly contribution or add an initial deposit to reach your goal.
                    </Text>
                  ) : monthsToGoal > calculateMonthsBetween() ? (
                    <Text color="orange.500" mt={2}>
                      To reach your goal by {formatDate(targetDate)}, consider increasing your monthly contribution to {formatCurrency(targetMonthlyContribution)}.
                    </Text>
                  ) : (
                    <Text color="green.500" mt={2}>
                      You're on track to reach your goal{interestRate > 0 ? ', and your interest will help you get there even faster' : ''}!
                    </Text>
                  )}
                  
                  {currentSavings + initialDeposit === 0 && (
                    <Text mt={2}>
                      Starting with an initial deposit can significantly accelerate your progress.
                    </Text>
                  )}
                  
                  {interestRate === 0 && (
                    <Text mt={2}>
                      Consider moving your savings to an account with interest to reach your goals faster.
                    </Text>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>
          
          
        </GridItem>
      </Grid>
    </Box>
  );
}

export default SavingsGoalCalculator;