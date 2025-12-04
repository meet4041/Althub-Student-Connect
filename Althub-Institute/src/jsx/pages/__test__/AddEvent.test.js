import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddEvent from '../AddEvent';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// 1. Mock External Dependencies
jest.mock('axios');
jest.mock('react-toastify', () => ({
    toast: { success: jest.fn(), error: jest.fn() },
    ToastContainer: () => <div />
}));

// 2. Mock Child Components to isolate the unit test
// This prevents errors if Menu/Footer have their own API calls or complex logic
jest.mock('../../layout/Menu', () => () => <div data-testid="menu">Menu</div>);
jest.mock('../../layout/Footer', () => () => <div data-testid="footer">Footer</div>);
jest.mock('../../layout/Loader', () => () => <div data-testid="loader">Loader</div>);

// 3. Mock Navigation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

describe('AddEvent Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Set the Institute ID so validation passes
        localStorage.setItem('AlmaPlus_institute_Id', 'inst_123');
    });

    test('submits new event form successfully', async () => {
        // Setup successful API response
        axios.mockResolvedValue({ data: { success: true } });

        render(
            <BrowserRouter>
                <AddEvent />
            </BrowserRouter>
        );

        // 4. Fill OUT ALL REQUIRED FIELDS
        // The component validate() function checks for Title, Description, Date, and Venue

        // Title
        const titleInput = screen.getByPlaceholderText(/Enter Event Title/i);
        fireEvent.change(titleInput, { target: { value: 'Graduation Ceremony' } });

        // Description
        const descInput = screen.getByPlaceholderText(/Enter Event Description/i);
        fireEvent.change(descInput, { target: { value: 'Celebrating the class of 2024' } });

        // Date (datetime-local input)
        const dateInput = screen.getByPlaceholderText(/Enter Event Date/i);
        fireEvent.change(dateInput, { target: { value: '2024-05-20T10:00' } });

        // Venue
        const venueInput = screen.getByPlaceholderText(/Enter Event venue/i);
        fireEvent.change(venueInput, { target: { value: 'Main Auditorium' } });

        // 5. Submit the form
        const submitBtn = screen.getByText('Submit'); // Button text from your ternary operator
        fireEvent.click(submitBtn);

        // 6. Verify API Call AND Navigation
        await waitFor(() => {
            // Check API was called
            expect(axios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'post',
                url: expect.stringContaining('/api/addEvent'),
                data: expect.any(FormData)
            }));

            // Check Navigation (Moved INSIDE waitFor)
            expect(mockedNavigate).toHaveBeenCalledWith('/events');

        }, { timeout: 3000 }); // Increased timeout to be safe (needs to be > 1500ms)
    });

    test('shows validation errors for empty fields', () => {
        render(
            <BrowserRouter>
                <AddEvent />
            </BrowserRouter>
        );

        // Click submit without typing anything
        fireEvent.click(screen.getByText('Submit'));

        // Check for error messages (based on your errors object keys)
        expect(screen.getByText('Please Enter Title')).toBeInTheDocument();
        expect(screen.getByText('Please Enter Event Description')).toBeInTheDocument();
        expect(screen.getByText('Please Enter Date')).toBeInTheDocument();
        expect(screen.getByText('Please Enter Venue')).toBeInTheDocument();

        // Ensure API was NOT called
        expect(axios).not.toHaveBeenCalled();
    });
});