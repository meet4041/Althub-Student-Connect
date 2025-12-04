import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../Register';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// --- 1. Setup Mocks ---

// Mock React-Toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock React-Select to make it interactable in tests
jest.mock('react-select', () => ({ options, value, onChange, placeholder }) => {
  function handleChange(event) {
    const option = options.find(
      (opt) => opt.value === event.currentTarget.value
    );
    // Simulate selecting an option (passing it as an array for isMulti)
    onChange([option]);
  }
  return (
    <select data-testid={placeholder} onChange={handleChange}>
      <option value="">{placeholder}</option>
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
});

// Mock Axios
jest.mock('axios');

// Mock Navigation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Register Component', () => {
  
  // Helper to fill Step 1 (Personal Details)
  const fillStep1 = () => {
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Date of Birth'), { target: { value: '2000-01-01' } });
    
    // Select Gender (Radio button)
    const maleRadio = screen.getByLabelText('Male');
    fireEvent.click(maleRadio);

    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@test.com' } });
    
    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  };

  // Helper to fill Step 3 (Additional Info)
  const fillStep3 = async () => {
    // 1. Select Institute (Custom Dropdown)
    const instituteDropdown = screen.getByText(/Select Institute/i);
    fireEvent.click(instituteDropdown); 
    // Wait for the mock institute to appear and click it
    const instituteOption = await screen.findByText('Test Institute');
    fireEvent.click(instituteOption);

    // 2. Select Language (Mocked React-Select)
    fireEvent.change(screen.getByTestId('Select Language'), { target: { value: 'English' } });

    // 3. Select Skill (Mocked React-Select)
    fireEvent.change(screen.getByTestId('Select Skills'), { target: { value: 'Java' } });

    // 4. Fill Address
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'India' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'Gujarat' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Ahmedabad' } });

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Fix 1: Mock the initial 'getInstitutes' call to prevent crash
    axios.mockImplementation((config) => {
      if (config.method === 'get' && config.url.includes('getInstitutes')) {
        return Promise.resolve({ 
          data: { 
            data: [{ name: 'Test Institute', image: 'test.jpg' }] 
          } 
        });
      }
      // Handle file upload or other default calls
      return Promise.resolve({ data: { data: { url: 'fake-url' } } });
    });

    // Mock the POST request for registration
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  test('navigates through all steps and submits', async () => {
    await act(async () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Register />
        </BrowserRouter>
      );
    });

    // --- STEP 1: Personal Details ---
    fillStep1();

    // --- STEP 2: Social Profiles ---
    // (Optional, just click Next)
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // --- STEP 3: Additional Details ---
    await fillStep3();

    // --- STEP 4: Upload Profile ---
    // (Optional, just click Next)
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // --- STEP 5: Account Setup (Password) ---
    // Now the password field should be visible
    const passInput = screen.getByPlaceholderText('Password');
    const confirmPassInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPassInput, { target: { value: 'password123' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);

    // Verify Submission
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          email: 'john@test.com',
          password: 'password123',
          institute: 'Test Institute'
        })
      );
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('validates password mismatch on step 5', async () => {
    await act(async () => {
      render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Register />
        </BrowserRouter>
      );
    });

    // Fast-forward to Step 5
    fillStep1();
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Skip Step 2
    await fillStep3();
    fireEvent.click(screen.getByRole('button', { name: /next/i })); // Skip Step 4

    // Enter mismatching passwords
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'mismatch' } });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert validation error
    expect(screen.getByText('Password not match')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
});