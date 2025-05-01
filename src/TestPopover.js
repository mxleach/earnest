// src/TestPopover.js
import React from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';

function TestPopover() {
  return (
    <Box minH="100vh" p={8} bg="gray.100">
      <Box
        w="300px"
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
        position="relative"
        zIndex={0}
      >
        <Popover placement="bottom-start" usePortal isLazy closeOnBlur={false}>
          <PopoverTrigger>
            <IconButton icon={<FiClock />} aria-label="Open" />
          </PopoverTrigger>
          <PopoverContent
            zIndex={9999}
            bg="white"
            boxShadow="xl"
            borderColor="blue.300"
            borderWidth={1}
            p={4}
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <Box>Popover content is clearly visible!</Box>
              <Button mt={2}>Test</Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Box>
  );
}

export default TestPopover;
