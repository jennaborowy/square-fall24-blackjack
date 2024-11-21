import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebaseConfig";
import { useAuth } from "@/app/context/auth";
import LobbyLayout from '../app/lobby/layout';

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/firebaseConfig', () => ({
    auth: {
        onAuthStateChanged: jest.fn(),
    },
    signOut: jest.fn()
}));

jest.mock('@/app/context/auth', () => ({
    useAuth: jest.fn()
}));

global.fetch = jest.fn();

describe('LobbyLayout', () => {
    const mockRouter = {
        push: jest.fn()
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
        global.fetch.mockReset();

        // Mock window.matchMedia for Material-UI responsive design
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    describe('Authentication States', () => {
        test('renders correctly for admin user', async () => {
            // Mock admin user
            const mockUser = {
                displayName: 'Admin User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: true, accountUser: true }
                })
            };

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(
                <LobbyLayout>
                    <div>Child content</div>
                </LobbyLayout>
            );

            // Wait for claims to be processed and check desktop navigation buttons
            await waitFor(() => {
                const navButtons = screen.getAllByRole('link');
                const manageUsersButton = navButtons.find(button =>
                    button.getAttribute('href') === '/lobby/manageusers'
                );
                expect(manageUsersButton).toBeInTheDocument();
            });

            // Check for other navigation links
            const statsButton = screen.getByRole('link', { name: /view stats/i });
            const friendsButton = screen.getByRole('link', { name: /manage friends/i });

            expect(statsButton).toBeInTheDocument();
            expect(friendsButton).toBeInTheDocument();
            expect(screen.getByText('Admin User')).toBeInTheDocument();
        });

        test('renders correctly for account user', async () => {
            const mockUser = {
                displayName: 'Regular User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: false, accountUser: true }
                })
            };

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(
                <LobbyLayout>
                    <div>Child content</div>
                </LobbyLayout>
            );

            // Check for presence of regular user navigation
            await waitFor(() => {
                const statsButton = screen.getByRole('link', { name: /view stats/i });
                const friendsButton = screen.getByRole('link', { name: /manage friends/i });
                expect(statsButton).toBeInTheDocument();
                expect(friendsButton).toBeInTheDocument();
            });

            // Verify admin features are not present
            const navButtons = screen.getAllByRole('link');
            const manageUsersButton = navButtons.find(button =>
                button.getAttribute('href') === '/lobby/manageusers'
            );
            expect(manageUsersButton).toBeUndefined();

            expect(screen.getByText('Regular User')).toBeInTheDocument();
        });

        test('renders correctly for guest user', async () => {
            const mockUser = {
                displayName: 'Guest User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: false, accountUser: false }
                })
            };

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(
                <LobbyLayout>
                    <div>Child content</div>
                </LobbyLayout>
            );

            // Verify no navigation buttons are present
            await waitFor(() => {
                const navButtons = screen.getAllByRole('link');
                expect(navButtons.every(button =>
                    !button.getAttribute('href')?.includes('/lobby/stats') &&
                    !button.getAttribute('href')?.includes('/lobby/managefriends') &&
                    !button.getAttribute('href')?.includes('/lobby/manageusers')
                )).toBe(true);
            });

            expect(screen.getByText('Guest User')).toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        test('handles logout for deleted user', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            const mockUser = {
                displayName: 'Account User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: false, accountUser: true }
                })
            };
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUser)
                })
            );

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            global.fetch.mockImplementationOnce(() =>
                Promise.reject(new Error('Failed to fetch'))
            );

            render(
                <LobbyLayout>
                    <div>Child content</div>
                </LobbyLayout>
            );


            await waitFor(() => {
                const avatarButton = screen.getByLabelText("user icon");
                fireEvent.click(avatarButton);

                // Click logout
                const logoutButton = screen.getByTitle('exit');
                fireEvent.click(logoutButton);

                expect(consoleLogSpy).toHaveBeenCalledWith(
                    "deleted user"
                );

                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
            consoleLogSpy.mockRestore();
        });

        test('handles logout for user', async () => {
            const mockUser = {
                displayName: 'Account User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: false, accountUser: true }
                })
            };
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                })
            );

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(
                <LobbyLayout>
                    <div>Child content</div>
                </LobbyLayout>
            );


            await waitFor(() => {
                const avatarButton = screen.getByLabelText("user icon");
                fireEvent.click(avatarButton);

                // Click logout
                const logoutButton = screen.getByTitle('exit');
                fireEvent.click(logoutButton);

                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });

        test('handles mobile menu navigation', async () => {
            // Mock window.matchMedia to simulate mobile view
            window.matchMedia.mockImplementation(query => ({
                matches: query === '(max-width:900px)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const mockUser = {
                displayName: 'Account User',
                getIdTokenResult: () => Promise.resolve({
                    claims: { admin: false, accountUser: true }
                })
            };

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(<LobbyLayout />);

            // Open mobile menu
            const menuButton = screen.getByLabelText('account of current user');
            fireEvent.click(menuButton);

            // Check menu items
            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                expect(menuItems.some(item => item.textContent === 'View Stats')).toBe(true);
                expect(menuItems.some(item => item.textContent === 'Manage Friends')).toBe(true);
            });
        });
    });

    describe('Error Handling', () => {
        test('handles error when fetching claims', async () => {
            console.error = jest.fn();

            const mockUser = {
                displayName: 'Error User',
                getIdTokenResult: () => Promise.reject(new Error('Failed to fetch claims'))
            };

            useAuth.mockReturnValue({ currentUser: mockUser });
            auth.onAuthStateChanged.mockImplementation(cb => {
                cb(mockUser);
                return () => {};
            });

            render(<LobbyLayout />);

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith(
                    'Error fetching claims:',
                    expect.any(Error)
                );
            });
        });

    });
});