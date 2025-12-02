import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// 1. Mock Dependencies
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div>Toast Container</div>
}));

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock the baseURL
jest.mock('../baseURL', () => ({
  ALTHUB_API_URL: 'http://localhost:5000'
}));

describe('Institute Login Component', () => {
  
  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock the loader element which the component tries to access
    document.body.innerHTML = `
      <div id="page-loader"></div>
      <div id="page-container"></div>
    `;
  });

  test('renders institute login form correctly', () => {
    renderLogin();
    expect(screen.getByText(/Login for Althub Institute panel/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'institute@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'inst123' } });

    expect(emailInput.value).toBe('institute@test.com');
    expect(passwordInput.value).toBe('inst123');
  });

  test('validates empty inputs', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Please Enter Email')).toBeInTheDocument();
    expect(screen.getByText('Please Enter Password')).toBeInTheDocument();
    expect(axios).not.toHaveBeenCalled();
  });

  test('submits form successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { _id: 'inst_123', name: 'Test Institute' }
      }
    };
    axios.mockResolvedValue(mockResponse);

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'valid@inst.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: "post",
        url: expect.stringContaining('/api/instituteLogin')
      }));
      expect(localStorage.getItem('AlmaPlus_institute_Id')).toBe('inst_123');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});