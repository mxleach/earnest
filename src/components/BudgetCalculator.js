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
  FormLabel,
  Divider,
  Flex,
  Progress,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiDownload, FiPieChart } from 'react-icons/fi';

// Budget Item Structure
const defaultIncomeCategories = [
  { id: 'salary', name: 'Salary & Wages', amount: 0, frequency: 'month' },
  { id: 'investments', name: 'Investment Income', amount: 0, frequency: 'month' },
  { id: 'side_hustles', name: 'Side Hustle/Freelance', amount: 0, frequency: 'month' },
  { id: 'other_income', name: 'Other Income', amount: 0, frequency: 'month' },
];

const defaultExpenseCategories = [
  { 
    id: 'housing',
    name: 'Housing & Utilities',
    items: [
      { id: 'rent', name: 'Rent/Mortgage', amount: 0, frequency: 'month' },
      { id: 'utilities', name: 'Utilities', amount: 0, frequency: 'month' },
      { id: 'internet', name: 'Internet/Phone', amount: 0, frequency: 'month' },
      { id: 'home_insurance', name: 'Home Insurance', amount: 0, frequency: 'year' },
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    items: [
      { id: 'car_payment', name: 'Car Payment', amount: 0, frequency: 'month' },
      { id: 'car_insurance', name: 'Car Insurance', amount: 0, frequency: 'month' },
      { id: 'gas', name: 'Gas', amount: 0, frequency: 'month' },
      { id: 'maintenance', name: 'Maintenance', amount: 0, frequency: 'month' },
    ]
  },
  {
    id: 'food',
    name: 'Food & Dining',
    items: [
      { id: 'groceries', name: 'Groceries', amount: 0, frequency: 'month' },
      { id: 'eating_out', name: 'Eating Out', amount: 0, frequency: 'month' },
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    items: [
      { id: 'health_insurance', name: 'Health Insurance', amount: 0, frequency: 'month' },
      { id: 'gym', name: 'Gym Membership', amount: 0, frequency: 'month' },
      { id: 'clothing', name: 'Clothing', amount: 0, frequency: 'month' },
      { id: 'entertainment', name: 'Entertainment', amount: 0, frequency: 'month' },
    ]
  },
  {
    id: 'debt',
    name: 'Debt Payments',
    items: [
      { id: 'credit_cards', name: 'Credit Cards', amount: 0, frequency: 'month' },
      { id: 'student_loans', name: 'Student Loans', amount: 0, frequency: 'month' },
      { id: 'personal_loans', name: 'Personal Loans', amount: 0, frequency: 'month' },
    ]
  },
  {
    id: 'savings',
    name: 'Savings & Investments',
    items: [
      { id: 'emergency_fund', name: 'Emergency Fund', amount: 0, frequency: 'month' },
      { id: 'retirement', name: 'Retirement', amount: 0, frequency: 'month' },
      { id: 'investments', name: 'Other Investments', amount: 0, frequency: 'month' },
    ]
  },
];

function BudgetCalculator() {
  const [incomeItems, setIncomeItems] = useState(defaultIncomeCategories);
  const [expenseCategories, setExpenseCategories] = useState(defaultExpenseCategories);
  const [newItemName, setNewItemName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [taxRate, setTaxRate] = useState(20); // Default tax rate
  
  const { isOpen: isAddCategoryOpen, onOpen: onAddCategoryOpen, onClose: onAddCategoryClose } = useDisclosure();
  const { isOpen: isAddItemOpen, onOpen: onAddItemOpen, onClose: onAddItemClose } = useDisclosure();
  const { isOpen: isChartOpen, onOpen: onChartOpen, onClose: onChartClose } = useDisclosure();

  // Normalize values to monthly
  const normalizeToMonthly = (amount, frequency) => {
    switch (frequency) {
      case 'day': return amount * 30;
      case 'week': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'month': return amount;
      case 'quarter': return amount / 3;
      case 'year': return amount / 12;
      default: return amount;
    }
  };

  // Calculate total monthly income
  const calculateTotalIncome = () => {
    return incomeItems.reduce((total, item) => {
      return total + normalizeToMonthly(parseFloat(item.amount) || 0, item.frequency);
    }, 0);
  };

  // Calculate total monthly expenses
  const calculateTotalExpenses = () => {
    return expenseCategories.reduce((total, category) => {
      return total + category.items.reduce((categoryTotal, item) => {
        return categoryTotal + normalizeToMonthly(parseFloat(item.amount) || 0, item.frequency);
      }, 0);
    }, 0);
  };

  // Calculate est. post tax income
  const calculateAfterTaxIncome = () => {
    const totalIncome = calculateTotalIncome();
    return totalIncome * (1 - (taxRate / 100));
  };

  // Calculate rem, monthly budget
  const calculateRemainingBudget = () => {
    return calculateAfterTaxIncome() - calculateTotalExpenses();
  };

  // Update income item
  const updateIncomeItem = (id, field, value) => {
    setIncomeItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Update expense item
  const updateExpenseItem = (categoryId, itemId, field, value) => {
    setExpenseCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
          )
        } : category
      )
    );
  };

  // Add new income item
  const addIncomeItem = () => {
    if (!newItemName) return;
    const newId = `income_${Date.now()}`;
    setIncomeItems(prev => [...prev, { 
      id: newId, 
      name: newItemName, 
      amount: 0, 
      frequency: 'month' 
    }]);
    setNewItemName('');
    onAddItemClose();
  };

  // Add new expense category
  const addExpenseCategory = () => {
    if (!newCategoryName) return;
    const newId = `category_${Date.now()}`;
    setExpenseCategories(prev => [...prev, { 
      id: newId, 
      name: newCategoryName, 
      items: [] 
    }]);
    setNewCategoryName('');
    onAddCategoryClose();
  };

  // Add new expense item to a category
  const addExpenseItem = () => {
    if (!newItemName || !activeCategoryId) return;
    const newId = `expense_${Date.now()}`;
    setExpenseCategories(prev => 
      prev.map(category => 
        category.id === activeCategoryId ? {
          ...category,
          items: [...category.items, { 
            id: newId, 
            name: newItemName, 
            amount: 0, 
            frequency: 'month' 
          }]
        } : category
      )
    );
    setNewItemName('');
    onAddItemClose();
  };

  // Remove income item
  const removeIncomeItem = (id) => {
    setIncomeItems(prev => prev.filter(item => item.id !== id));
  };

  // Remove expense item
  const removeExpenseItem = (categoryId, itemId) => {
    setExpenseCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        } : category
      )
    );
  };

  // Remove expense category
  const removeExpenseCategory = (categoryId) => {
    setExpenseCategories(prev => prev.filter(category => category.id !== categoryId));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate breakdown percentages
  const calculateBreakdown = () => {
    const totalExpenses = calculateTotalExpenses();
    
    return expenseCategories.map(category => {
      const categoryTotal = category.items.reduce((total, item) => {
        return total + normalizeToMonthly(parseFloat(item.amount) || 0, item.frequency);
      }, 0);
      
      const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;
      
      return {
        id: category.id,
        name: category.name,
        amount: categoryTotal,
        percentage
      };
    });
  };

  // Export budget as CSV
  const exportBudget = () => {
    const breakdown = calculateBreakdown();
    const incomeTotal = calculateTotalIncome();
    const expensesTotal = calculateTotalExpenses();
    const afterTaxIncome = calculateAfterTaxIncome();
    const remaining = calculateRemainingBudget();
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "Budget Summary\r\n\r\n";
    
    // Income
    csvContent += "INCOME\r\n";
    csvContent += "Item,Amount,Frequency\r\n";
    incomeItems.forEach(item => {
      csvContent += `${item.name},${item.amount},${item.frequency}\r\n`;
    });
    csvContent += `Total Monthly Income,${incomeTotal}\r\n`;
    csvContent += `Estimated After-Tax Income,${afterTaxIncome}\r\n\r\n`;
    
    // Expenses
    csvContent += "EXPENSES\r\n";
    breakdown.forEach(category => {
      csvContent += `${category.name},${category.amount},${category.percentage.toFixed(1)}%\r\n`;
    });
    csvContent += `Total Monthly Expenses,${expensesTotal}\r\n\r\n`;
    
    // Summary
    csvContent += "SUMMARY\r\n";
    csvContent += `Monthly Income,${afterTaxIncome}\r\n`;
    csvContent += `Monthly Expenses,${expensesTotal}\r\n`;
    csvContent += `Remaining,${remaining}\r\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "budget.csv");
    document.body.appendChild(link);
    
    link.click();
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md" color="brand.charcoal">Budget Planner</Heading>
        <HStack>
          <Button 
            leftIcon={<FiDownload />} 
            size="sm" 
            onClick={exportBudget}
            colorScheme="blue"
            bg="brand.persianGreen"
            _hover={{ bg: "brand.mint", color: "brand.charcoal" }}
          >
            Export
          </Button>
          <Button
            leftIcon={<FiPieChart />}
            size="sm"
            onClick={onChartOpen}
            colorScheme="blue"
            bg="brand.persianGreen"
            _hover={{ bg: "brand.mint", color: "brand.charcoal" }}
          >
            View Breakdown
          </Button>
        </HStack>
      </Flex>

      {/* Budget Summary Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
        <GridItem>
          <Stat bg="white" p={3} borderRadius="md" boxShadow="sm">
            <StatLabel color="brand.charcoal">Monthly Income</StatLabel>
            <StatNumber color="brand.persianGreen" fontSize="xl">
              {formatCurrency(calculateTotalIncome())}
            </StatNumber>
            <StatHelpText>Before Taxes</StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat bg="white" p={3} borderRadius="md" boxShadow="sm">
            <StatLabel color="brand.charcoal">After Tax</StatLabel>
            <StatNumber color="brand.persianGreen" fontSize="xl">
              {formatCurrency(calculateAfterTaxIncome())}
            </StatNumber>
            <StatHelpText>Est. {taxRate}% Tax Rate</StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat bg="white" p={3} borderRadius="md" boxShadow="sm">
            <StatLabel color="brand.charcoal">Monthly Expenses</StatLabel>
            <StatNumber color="brand.burntSienna" fontSize="xl">
              {formatCurrency(calculateTotalExpenses())}
            </StatNumber>
            <StatHelpText>All Categories</StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat bg="white" p={3} borderRadius="md" boxShadow="sm">
            <StatLabel color="brand.charcoal">Remaining</StatLabel>
            <StatNumber 
              color={calculateRemainingBudget() >= 0 ? "brand.mint" : "red.500"} 
              fontSize="xl"
            >
              {formatCurrency(calculateRemainingBudget())}
            </StatNumber>
            <StatHelpText>
              {calculateRemainingBudget() >= 0 ? "To Save/Invest" : "Deficit"}
            </StatHelpText>
          </Stat>
        </GridItem>
      </Grid>

      {/* Income Section */}
      <Box bg="white" p={4} borderRadius="md" boxShadow="sm" mb={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm" color="brand.charcoal">Income</Heading>
          <Button 
            size="xs" 
            leftIcon={<FiPlus />}
            onClick={onAddItemOpen}
            colorScheme="blue"
            variant="outline"
          >
            Add Item
          </Button>
        </Flex>

        <VStack spacing={3} align="stretch">
          {incomeItems.map(item => (
            <Flex key={item.id} alignItems="center">
              <Box flex="2">
                <Text fontSize="sm">{item.name}</Text>
              </Box>
              <Box flex="2">
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                  <NumberInput 
                    value={item.amount} 
                    onChange={(value) => updateIncomeItem(item.id, 'amount', value)}
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
              </Box>
              <Box flex="1.5" pl={2}>
                <Select 
                  size="sm"
                  value={item.frequency}
                  onChange={(e) => updateIncomeItem(item.id, 'frequency', e.target.value)}
                >
                  <option value="day">Per Day</option>
                  <option value="week">Per Week</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="month">Per Month</option>
                  <option value="year">Per Year</option>
                </Select>
              </Box>
              <Box flex="0.5" textAlign="right">
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeIncomeItem(item.id)}
                  aria-label="Remove item"
                />
              </Box>
            </Flex>
          ))}
        {incomeItems.length === 0 && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Every dollar has a purpose. Start by adding your first source of income.
          </Text>
        )}
        </VStack>
      </Box>

      {/* Tax Rate Adjustment */}
      <Box bg="white" p={4} borderRadius="md" boxShadow="sm" mb={6}>
        <Heading size="sm" color="brand.charcoal" mb={4}>Tax Rate</Heading>
        <HStack>
          <Text flex="1">Estimated Tax Rate (%)</Text>
          <NumberInput 
            value={taxRate} 
            onChange={(value) => setTaxRate(parseFloat(value))}
            min={0}
            max={100}
            precision={1}
            step={0.5}
            w="150px"
          >
            <NumberInputField borderColor="gray.300" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </Box>

      {/* Expenses Section */}
      <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm" color="brand.charcoal">Expenses</Heading>
          <Button 
            size="xs" 
            leftIcon={<FiPlus />}
            onClick={onAddCategoryOpen}
            colorScheme="blue"
            variant="outline"
          >
            Add Category
          </Button>
        </Flex>

        <VStack spacing={6} align="stretch">
          {expenseCategories.map(category => (
            <Box key={category.id}>
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="xs" color="brand.charcoal">{category.name}</Heading>
                <HStack>
                  <Button 
                    size="xs" 
                    leftIcon={<FiPlus />}
                    onClick={() => {
                      setActiveCategoryId(category.id);
                      onAddItemOpen();
                    }}
                    colorScheme="blue"
                    variant="outline"
                  >
                    Add Item
                  </Button>
                  <IconButton
                    icon={<FiTrash2 />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeExpenseCategory(category.id)}
                    aria-label="Remove category"
                  />
                </HStack>
              </Flex>

              <VStack spacing={2} align="stretch">
                {category.items.map(item => (
                  <Flex key={item.id} alignItems="center">
                    <Box flex="2">
                      <Text fontSize="sm">{item.name}</Text>
                    </Box>
                    <Box flex="2">
                      <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none" color="gray.500">$</InputLeftElement>
                        <NumberInput 
                          value={item.amount} 
                          onChange={(value) => updateExpenseItem(category.id, item.id, 'amount', value)}
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
                    </Box>
                    <Box flex="1.5" pl={2}>
                      <Select 
                        size="sm"
                        value={item.frequency}
                        onChange={(e) => updateExpenseItem(category.id, item.id, 'frequency', e.target.value)}
                      >
                        <option value="day">Per Day</option>
                        <option value="week">Per Week</option>
                        <option value="month">Per Month</option>
                        <option value="year">Per Year</option>
                      </Select>
                    </Box>
                    <Box flex="0.5" textAlign="right">
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeExpenseItem(category.id, item.id)}
                        aria-label="Remove item"
                      />
                    </Box>
                  </Flex>
                ))}
              {category.items.length === 0 && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  No expenses here yet — let’s add one.
                </Text>
              )}
              </VStack>
            </Box>
          ))}
        {incomeItems.length === 0 && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Every dollar has a purpose. Start by adding your first source of income.
          </Text>
        )}
        </VStack>
      </Box>

      {/* Add Category Modal */}
      <Modal isOpen={isAddCategoryOpen} onClose={onAddCategoryClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Expense Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input 
              placeholder="Category Name" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddCategoryClose}>Cancel</Button>
            <Button 
              colorScheme="blue" 
              onClick={addExpenseCategory} 
              isDisabled={!newCategoryName}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={isAddItemOpen} onClose={onAddItemClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Add {activeCategoryId ? "Expense" : "Income"} Item
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input 
              placeholder="Item Name" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddItemClose}>Cancel</Button>
            <Button 
              colorScheme="blue" 
              onClick={activeCategoryId ? addExpenseItem : addIncomeItem} 
              isDisabled={!newItemName}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Breakdown Modal */}
      <Modal isOpen={isChartOpen} onClose={onChartClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Budget Breakdown</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Monthly expense breakdown by category:</Text>
            
            {calculateBreakdown().map(category => (
              <Box key={category.id} mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">{category.name}</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                  </Text>
                </Flex>
                <Progress 
                  value={category.percentage} 
                  size="sm" 
                  colorScheme={
                    category.percentage > 30 ? "red" : 
                    category.percentage > 20 ? "yellow" : "green"
                  } 
                  borderRadius="full"
                />
              </Box>
            ))}
            
            <Divider my={4} />
            
            <Flex justify="space-between">
              <Box>
                <Text fontWeight="bold">Total Monthly Expenses:</Text>
                <Text fontWeight="bold" color={calculateRemainingBudget() >= 0 ? "green.500" : "red.500"}>
                  Remaining:
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontWeight="bold">{formatCurrency(calculateTotalExpenses())}</Text>
                <Text fontWeight="bold" color={calculateRemainingBudget() >= 0 ? "green.500" : "red.500"}>
                  {formatCurrency(calculateRemainingBudget())}
                </Text>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onChartClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default BudgetCalculator;