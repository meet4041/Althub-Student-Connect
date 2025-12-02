import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// 1. Mock dependencies
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Login Component', () => {
  
    // Helper to render component wrapped in Router
    const renderLogin = () => {
      render(
        // ADD THE future PROP HERE:
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Login />
        </BrowserRouter>
      );
    };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderLogin();
    
    // Check for main elements
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  test('allows user to enter email and password', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('Enter Your Email');
    const passwordInput = screen.getByPlaceholderText('Enter Your Password');

    // Simulate typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits form with valid credentials', async () => {
    // Setup Mock API Response
    const mockResponse = {
      data: {
        data: { _id: '12345' }
      }
    };
    axios.mockResolvedValue(mockResponse);

    renderLogin();

    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Enter Your Email'), { target: { value: 'student@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: 'securePass' } });

    // Click Submit
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Assertions
    await waitFor(() => {
      // 1. Check if Axios was called with correct data
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'post',
        data: {
          email: 'student@test.com',
          password: 'securePass'
        },
        url: expect.stringContaining('/api/userLogin')
      }));

      // 2. Check if user was redirected to home
      expect(mockedNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('shows error when fields are empty', () => {
    renderLogin();
    
    // Click Submit without typing anything
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Axios should NOT be called
    expect(axios).not.toHaveBeenCalled();
  });
});