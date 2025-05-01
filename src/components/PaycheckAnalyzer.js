import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Button,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const LOCAL_KEY = 'paycheckEntries';

function PaycheckAnalyzer() {
  const [paychecks, setPaychecks] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [{ id: 1, hours: 40, rate: 20, gross: 800, net: 640 }];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(paychecks));
  }, [paychecks]);

  const addEntry = () => {
    const newEntry = {
      id: Date.now(),
      hours: 0,
      rate: 0,
      gross: 0,
      net: 0,
    };
    setPaychecks([...paychecks, newEntry]);
  };

  const updateEntry = (id, field, value) => {
    setPaychecks((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEntry = (id) => {
    setPaychecks((prev) => prev.filter((entry) => entry.id !== id));
  };

  const averageDeductionRate = useMemo(() => {
    const valid = paychecks.filter((p) => p.gross > 0 && p.net > 0);
    if (valid.length === 0) return 0;
    const avg = valid.reduce((acc, p) => acc + (p.gross - p.net) / p.gross, 0);
    return (avg / valid.length) * 100;
  }, [paychecks]);

  const estimateNextPay = useMemo(() => {
    const last = paychecks[paychecks.length - 1];
    if (!last || last.hours === 0 || last.rate === 0) return null;

    const gross = last.hours * last.rate;
    const estimatedNet = gross * (1 - averageDeductionRate / 100);
    return { gross, net: estimatedNet };
  }, [paychecks, averageDeductionRate]);

  return (
    <Box mt={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Paycheck Analyzer
      </Text>

      <VStack spacing={6} align="stretch">
        {paychecks.map((entry) => (
          <Box
            key={entry.id}
            border="1px solid #e2e8f0"
            borderRadius="md"
            p={4}
            bg="gray.50"
          >
            <HStack justify="space-between" mb={3}>
              <Text fontWeight="medium">Paycheck Entry</Text>
              <IconButton
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => removeEntry(entry.id)}
                aria-label="Remove entry"
              />
            </HStack>

            <VStack spacing={3}>
              <FormControl>
                <FormLabel>Hours Worked</FormLabel>
                <NumberInput
                  value={entry.hours}
                  onChange={(v) => updateEntry(entry.id, 'hours', v)}
                  step={0.25}
                  precision={2}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <NumberInput
                  value={entry.rate}
                  onChange={(v) => updateEntry(entry.id, 'rate', v)}
                  step={0.01}
                  precision={2}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Gross Pay ($)</FormLabel>
                <NumberInput
                  value={entry.gross}
                  onChange={(v) => updateEntry(entry.id, 'gross', v)}
                  step={0.01}
                  precision={2}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Net Pay ($)</FormLabel>
                <NumberInput
                  value={entry.net}
                  onChange={(v) => updateEntry(entry.id, 'net', v)}
                  step={0.01}
                  precision={2}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </Box>
        ))}

        <Button
          onClick={addEntry}
          leftIcon={<FiPlus />}
          colorScheme="blue"
          variant="solid"
          size="sm"
          alignSelf="flex-start"
        >
          Add Paycheck
        </Button>

        <Divider />

        {paychecks.length > 0 && (
          <Box mt={4}>
            <Text fontSize="md" fontWeight="medium">
              Average Deduction Rate:{' '}
              <Text as="span" fontWeight="bold" color="brand.persianGreen">
                {averageDeductionRate.toFixed(1)}%
              </Text>
            </Text>

            {estimateNextPay && (
              <Box mt={3}>
                <Text fontSize="md" fontWeight="medium">
                  Estimated Next Gross: ${estimateNextPay.gross.toFixed(2)}
                </Text>
                <Text fontSize="md" fontWeight="medium">
                  Estimated Next Net: ${estimateNextPay.net.toFixed(2)}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default PaycheckAnalyzer;
