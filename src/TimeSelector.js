// src/components/TimeSelector.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Select,
  HStack,
  Text,
  Input,
  IconButton,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  InputGroup,
  Tooltip,
} from '@chakra-ui/react';
import { FiClock, FiInfo } from 'react-icons/fi';

function TimeSelector({ value, onChange }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [manualInput, setManualInput] = useState(value || '');

  const [promptAmPm, setPromptAmPm] = useState(false);
  const ambiguousTimeRef = useRef(null);
  const cancelRef = useRef();

  // Enhanced parse function that can handle more input formats
  const parseTimeFormat = (input) => {
    if (!input) return null;
    
    // Handle various formats: 9:30AM, 9:30 AM, 9:30 am, 9:30am, 9:30, 930, 930am, etc.
    const cleanedInput = input.trim().toLowerCase().replace(/\s+/g, '');
    
    // Try to match common patterns
    let match;
    
    // Pattern 1: HH:MM AM/PM
    match = cleanedInput.match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
    if (match) {
      const [, h, m, period] = match;
      return { hour: parseInt(h), minute: parseInt(m), period: period || null };
    }
    
    // Pattern 2: HHMM AM/PM (no colon)
    match = cleanedInput.match(/^(\d{1,2})(\d{2})(am|pm)?$/);
    if (match) {
      const [, h, m, period] = match;
      return { hour: parseInt(h), minute: parseInt(m), period: period || null };
    }
    
    // Pattern 3: H AM/PM (just hour)
    match = cleanedInput.match(/^(\d{1,2})(am|pm)$/);
    if (match) {
      const [, h, period] = match;
      return { hour: parseInt(h), minute: 0, period };
    }
    
    // Pattern 4: Just a number (assume hour)
    match = cleanedInput.match(/^(\d{1,2})$/);
    if (match) {
      const [, h] = match;
      return { hour: parseInt(h), minute: 0, period: null };
    }
    
    // Pattern 5: Military time (24-hour)
    match = cleanedInput.match(/^([01]\d|2[0-3])(\d{2})$/);
    if (match) {
      const [, h, m] = match;
      const hour24 = parseInt(h);
      return { 
        hour: hour24, 
        minute: parseInt(m), 
        period: hour24 >= 12 ? 'pm' : 'am',
        is24Hour: true
      };
    }
    
    // Pattern 6: Decimal hours (e.g., 9.5 for 9:30)
    match = cleanedInput.match(/^(\d{1,2})\.(\d{1,2})$/);
    if (match) {
      const [, h, fraction] = match;
      const hour = parseInt(h);
      const minute = Math.round(parseFloat(`0.${fraction}`) * 60);
      return { hour, minute, period: null };
    }
    
    // If no pattern matches
    return null;
  };

  useEffect(() => {
    if (value) {
      const parsedValue = parseTimeFormat(value);
      if (parsedValue) {
        const { hour: h, minute: m, period, is24Hour } = parsedValue;
        
        let hour12;
        let displayPeriod;
        
        if (is24Hour) {
          // Convert 24-hour to 12-hour for display
          hour12 = h % 12 || 12;
          displayPeriod = h >= 12 ? 'PM' : 'AM';
        } else {
          // Handle 12-hour format
          hour12 = (period && period.toLowerCase() === 'pm' && h < 12) ? h + 12 : 
                 (period && period.toLowerCase() === 'am' && h === 12) ? 0 : h;
          
          // Convert back to 12-hour display format
          hour12 = hour12 % 12 || 12;
          displayPeriod = (period && period.toLowerCase() === 'pm') || 
                        (!period && h >= 12) ? 'PM' : 'AM';
        }
        
        setHour(hour12.toString().padStart(2, '0'));
        setMinute(m.toString().padStart(2, '0'));
        setAmpm(displayPeriod);
        
        // Format the time string properly
        setManualInput(`${hour12}:${m.toString().padStart(2, '0')} ${displayPeriod}`);
      }
    }
  }, [value]);

  const handleSet = () => {
    const safeHour = parseInt(hour);
    const safeMinute = parseInt(minute);
    if (isNaN(safeHour) || isNaN(safeMinute)) return;
    const newValue = `${safeHour}:${safeMinute.toString().padStart(2, '0')} ${ampm}`;
    onChange(newValue);
    setManualInput(newValue);
    onClose();
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minuteOptions = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'
  ];

  const handleManualChange = (e) => {
    const val = e.target.value;
    setManualInput(val);
  };

  const handleBlur = () => {
    const parsedTime = parseTimeFormat(manualInput);
    
    if (!parsedTime) {
      // Invalid format - keep existing value
      if (value) {
        setManualInput(value);
      }
      return;
    }
    
    const { hour: h, minute: m, period, is24Hour } = parsedTime;
    
    if (!period && !is24Hour) {
      // Time without AM/PM designation
      ambiguousTimeRef.current = { h, m };
      setPromptAmPm(true);
      return;
    }
    
    // Valid time with period or 24-hour format
    let hour12;
    let displayPeriod;
    
    if (is24Hour) {
      // Convert 24-hour time to 12-hour format for display
      hour12 = h % 12 || 12;
      displayPeriod = h >= 12 ? 'PM' : 'AM';
    } else {
      // Handle 12-hour format
      hour12 = h % 12 || 12;
      displayPeriod = period ? period.toUpperCase() : (h >= 12 ? 'PM' : 'AM');
    }
    
    const formattedTime = `${hour12}:${m.toString().padStart(2, '0')} ${displayPeriod}`;
    onChange(formattedTime);
    setManualInput(formattedTime);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleAmPmChoice = (choice) => {
    const { h, m } = ambiguousTimeRef.current;
    if (isNaN(h) || isNaN(m)) return;
    const hour12 = h % 12 || 12;
    const result = `${hour12}:${m.toString().padStart(2, '0')} ${choice}`;
    onChange(result);
    setManualInput(result);
    setPromptAmPm(false);
    ambiguousTimeRef.current = null;
  };

  return (
    <Box position="relative">
      <InputGroup size="sm" mb={2}>
        <Input
          value={manualInput}
          onChange={handleManualChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          pr="2.5rem"
          placeholder="e.g. 9:30 AM, 14:45, 930"
          _hover={{ borderColor: 'brand.mint' }}
          _focus={{ borderColor: 'brand.mint', boxShadow: '0 0 0 1px var(--chakra-colors-brand-mint)' }}
        />
        <Tooltip label="Time formats: 9:30AM, 9:30, 930, 1445, 9.5 (9:30), etc." placement="top">
          <IconButton
            icon={<FiInfo />}
            size="xs"
            aria-label="Time format help"
            position="absolute"
            right="2.5rem"
            top="50%"
            transform="translateY(-50%)"
            variant="ghost"
            colorScheme="gray"
            zIndex="1"
          />
        </Tooltip>
        <Box position="absolute" right="0.25rem" top="50%" transform="translateY(-50%)">
          <Popover
            isOpen={isOpen}
            onClose={onClose}
            placement="bottom-start"
            isLazy
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <IconButton
                size="xs"
                icon={<FiClock />}
                variant="ghost"
                aria-label="Open time picker"
                onClick={onOpen}
                color="brand.mint"
                _hover={{ color: 'brand.persianGreen' }}
              />
            </PopoverTrigger>

            <Portal>
              <PopoverContent zIndex="popover" bg="white" border="1px solid" borderColor="brand.mint" boxShadow="xl">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <HStack spacing={2} mb={3}>
                    <Box>
                      <Text fontSize="sm">Hour</Text>
                      <Select value={hour} onChange={(e) => setHour(e.target.value)}>
                        {hourOptions.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <Text fontSize="sm">Minute</Text>
                      <Select value={minute} onChange={(e) => setMinute(e.target.value)}>
                        {minuteOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <Text fontSize="sm">AM/PM</Text>
                      <Select value={ampm} onChange={(e) => setAmpm(e.target.value)}>
                        <option>AM</option>
                        <option>PM</option>
                      </Select>
                    </Box>
                  </HStack>

                  <Button
                    size="sm"
                    width="100%"
                    bg="brand.peach"
                    color="black"
                    _hover={{ bg: 'brand.mint', color: 'white' }}
                    onClick={handleSet}
                  >
                    Set Time
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </Box>
      </InputGroup>

      <AlertDialog isOpen={promptAmPm} leastDestructiveRef={cancelRef} onClose={() => setPromptAmPm(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              AM or PM?
            </AlertDialogHeader>
            <AlertDialogBody>
              Do you mean <strong>{ambiguousTimeRef.current?.h}:{ambiguousTimeRef.current?.m?.toString().padStart(2, '0')}</strong> AM or PM?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setPromptAmPm(false)}>Cancel</Button>
              <Button colorScheme="blue" onClick={() => handleAmPmChoice('AM')} ml={3}>AM</Button>
              <Button colorScheme="orange" onClick={() => handleAmPmChoice('PM')} ml={3}>PM</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

// At the bottom of src/components/TimeSelector.js
export default React.memo(TimeSelector);