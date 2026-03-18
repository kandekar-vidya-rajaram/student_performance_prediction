// Example frontend test using Jest and fetch-mock (install with npm if needed)
// This assumes you have a login function that calls the backend API

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

test('student login redirects to student dashboard', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, role: 'student' }));

    // Simulate login function
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'student1', password: 'pass123' }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.role).toBe('student');
});

test('admin login redirects to admin dashboard', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true, role: 'admin' }));

    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin1', password: 'admin123' }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.role).toBe('admin');
});

test('invalid login shows error', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: false, message: 'Invalid credentials' }));

    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid credentials');
});