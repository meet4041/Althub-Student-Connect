import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// 1. Mock Dependencies
jest.mock('axios');
// Fix: Mock axios.defaults for the component's success block
axios.defaults = { headers: { common: {} } };

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div>Toast Container</div>
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('../../../baseURL', () => ({
    ALTHUB_API_URL: 'http://localhost:5000'
  }));

  describe('Admin Login Component', () => {
  
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
    localStorage.clear();
    // Mock the loader element
    document.body.innerHTML = `
      <div id="page-loader"></div>
      <div id="page-container"></div>
    `;
  });

  test('renders admin login form', () => {
    renderLogin();
    expect(screen.getByText(/Login for Althub Admin panel/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
  });

  test('submits successfully with auth token', async () => {
    const mockResponse = {
      data: {
        success: true,
        token: 'fake-jwt-token',
        data: { _id: 'admin_001' }
      }
    };
    axios.mockResolvedValue(mockResponse);

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'adminpass' } });
    
    // Find button by text since it might not have an aria-label in your code
    const submitBtn = screen.getByText('Sign In');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Verify API call details
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: "post",
        url: expect.stringContaining('/api/adminLogin')
      }));
      
      // Verify Token Storage
      expect(localStorage.getItem('AlmaPlus_admin_Token')).toBe('fake-jwt-token');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles incorrect credentials', async () => {
    const mockResponse = {
      data: { success: false, msg: 'Invalid' }
    };
    axios.mockResolvedValue(mockResponse);

    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});