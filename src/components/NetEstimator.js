
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Text,
  InputGroup,
  InputLeftElement,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';

function NetEstimator() {
  const [payType, setPayType] = useState('hour');
  const [rate, setRate] = useState(20);
  const [hoursWorked, setHoursWorked] = useState(40);
  const [daysWorked, setDaysWorked] = useState(5);
  const [deductions, setDeductions] = useState(0);
  const [taxRate, setTaxRate] = useState(20);

  const [grossPay, setGrossPay] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [netPay, setNetPay] = useState(null);

  const payPeriods = {
    hour: () => rate * hoursWorked,
    day: () => rate * daysWorked,
    week: () => rate,
    'bi-week': () => rate,
    'semi-month': () => rate,
    month: () => rate,
    quarter: () => rate,
    year: () => rate,
  };

  useEffect(() => {
    const gross = payPeriods[payType]?.() || 0;
    const tax = gross * (taxRate / 100);
    const net = gross - tax - deductions;

    setGrossPay(gross);
    setTaxAmount(tax);
    setNetPay(net);
  }, [payType, rate, hoursWorked, daysWorked, taxRate, deductions]);

  const shouldShowMessage =
    rate === 0 ||
    (payType === 'hour' && hoursWorked === 0) ||
    (payType === 'day' && daysWorked === 0);

  return (
    <VStack spacing={5} align="stretch">
      <FormControl>
        <FormLabel>Pay Type</FormLabel>
        <Select value={payType} onChange={(e) => setPayType(e.target.value)}>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="bi-week">Bi-Week</option>
          <option value="semi-month">Semi-Month</option>
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
          <option value="year">Year</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>
          {payType === 'hour' ? 'Hourly Rate ($)' :
           payType === 'day' ? 'Daily Rate ($)' :
           'Pay Amount ($)'}
        </FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
          <NumberInput
            value={rate}
            onChange={(value) => setRate(value)}
            step={0.01}
            precision={2}
            min={0}
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

      {payType === 'hour' && (
        <FormControl>
          <FormLabel>Hours Worked</FormLabel>
          <NumberInput
            value={hoursWorked}
            onChange={(value) => setHoursWorked(value)}
            step={0.25}
            precision={2}
            min={0}
            w="100%"
          >
            <NumberInputField borderColor="gray.300" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}

      {payType === 'day' && (
        <FormControl>
          <FormLabel>Days Worked</FormLabel>
          <NumberInput
            value={daysWorked}
            onChange={(value) => setDaysWorked(value)}
            step={0.25}
            precision={2}
            min={0}
            w="100%"
          >
            <NumberInputField borderColor="gray.300" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}

      <FormControl>
        <FormLabel>Tax Rate (%)</FormLabel>
        <NumberInput
          value={taxRate}
          onChange={(value) => setTaxRate(value)}
          step={0.1}
          precision={2}
          min={0}
          max={100}
          w="100%"
        >
          <NumberInputField borderColor="gray.300" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Other Deductions ($)</FormLabel>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
          <NumberInput
            value={deductions}
            onChange={(value) => setDeductions(value)}
            step={0.01}
            precision={2}
            min={0}
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

      {shouldShowMessage ? (
        <Text fontSize="sm" color="gray.500">
          Your estimated pay will appear here after entering your rate and hours.
        </Text>
      ) : (
        <Box
          bg="gray.50"
          p={4}
          borderRadius="md"
          borderLeft="4px solid"
          borderColor="brand.peach"
        >
          <Text fontSize="md">Gross Pay: ${Number(grossPay).toFixed(2)}</Text>
          <Text fontSize="md">Tax Amount: ${Number(taxAmount).toFixed(2)}</Text>
          <Text fontSize="xl" fontWeight="bold" color="brand.persianGreen">
            Net Estimate: ${Number(netPay).toFixed(2)}
          </Text>
        </Box>
      )}
    </VStack>
  );
}

export default NetEstimator;
