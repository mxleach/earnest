// src/components/AuthForm.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = () => {
  const toast = useToast();
  const { signUp, signIn } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Logged in successfully!', status: 'success' });
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({ title: 'Account created! Please log in.', status: 'success' });

        // ✅ Redirect to login form
        setIsLogin(true);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    }
  };

  const handleDemoLogin = async () => {
    try {
      const { error } = await signIn('demo@planner.com', 'test1234');
      if (error) throw error;
      toast({ title: 'Logged in as Demo User', status: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Box
      maxW="sm"
      mx="auto"
      mt={20}
      p={6}
      bg="white"
      borderRadius="md"
      boxShadow="lg"
    >
      <VStack spacing={4} align="stretch">
        
        <Box textAlign="center">
          <Heading size="lg" color="brand.charcoal" mb={1}>
            Welcome to Earnest,
          </Heading>
          <Text fontSize="sm" color="gray.600">
           Bring clarity to your week and your wallet.
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Plan purposefully. Live earnestly.
          </Text>
        </Box>
  
        <Divider my={4} />
  
        <Heading size="md" textAlign="center">
          {isLogin ? 'Log In' : 'Create an Account'}
        </Heading>
  
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </FormControl>
  
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </FormControl>
  
        <Button colorScheme="blue" onClick={handleAuth}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
  
        <Button variant="link" size="sm" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </Button>
  
        <Divider />
  
        <Button
          colorScheme="green"
          variant="outline"
          size="sm"
          onClick={handleDemoLogin}
        >
          Use Demo Account
        </Button>
  
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Demo email: demo@planner.com<br />
          Demo password: test1234
        </Text>
      </VStack>
    </Box>
  );
  
};

export default AuthForm;
