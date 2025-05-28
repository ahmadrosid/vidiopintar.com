// components/__tests__/AuthButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import AuthButton from '@/components/AuthButton'; // Adjust path as necessary
import '@testing-library/jest-dom';

// Mock next-auth/react
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
});

// Import the mocked useSession
import { useSession, signIn, signOut } from 'next-auth/react';

describe('AuthButton', () => {
  const mockUseSession = useSession as jest.Mock;

  it('renders login button when unauthenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<AuthButton />);
    expect(screen.getByRole('button', { name: /Login with Google/i })).toBeInTheDocument();
  });

  it('renders user email and logout button when authenticated', () => {
    const mockSession = {
      user: { email: 'test@example.com', name: 'Test User', image: 'test-image.jpg' },
    };
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
    render(<AuthButton />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });
  
  it('calls signIn when login button is clicked', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<AuthButton />);
    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));
    expect(signIn).toHaveBeenCalledWith('google');
  });

  it('calls signOut when logout button is clicked', () => {
    const mockSession = {
      user: { email: 'test@example.com' },
    };
    mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
    render(<AuthButton />);
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(signOut).toHaveBeenCalled();
  });

  it('renders loading state', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    render(<AuthButton />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
