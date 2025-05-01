import React from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import NetEstimator from './NetEstimator';
import PaycheckAnalyzer from './PaycheckAnalyzer';

function NetPayCalculator() {
  return (
    <Card bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      <CardHeader bg="brand.mint" py={4}>
        <Heading size="md" color="brand.charcoal">Net Pay Calculator</Heading>
      </CardHeader>

      <CardBody>
        <Tabs isFitted variant="enclosed">
          <TabList mb={4}>
            <Tab>Net Estimator</Tab>
            <Tab>Paycheck Analyzer</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <NetEstimator />
            </TabPanel>
            <TabPanel p={0}>
              <PaycheckAnalyzer />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
}

export default NetPayCalculator;
