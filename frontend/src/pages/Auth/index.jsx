import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate for react-router-dom
import { CLIENT_URL, REACT_PORT, SERVER_URL } from '../../config';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);  // State to toggle between login and registration
  const navigate = useNavigate();  // Replaces useRouter for react-router-dom

  // Submit user login or registration
  function submitUser(event) {
    event.preventDefault();

    const url = isRegistering ? `${CLIENT_URL}:${REACT_PORT}/api/auth/register` || `${SERVER_URL}/api/auth/register` : `${CLIENT_URL}:${REACT_PORT}/api/auth` || `${SERVER_URL}/api/auth`;
    
    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        // Check for 401 Unauthorized status
        if (res.status === 401) {
          alert('Invalid credentials. Please register a new account.');
          setIsRegistering(true);  // Switch to registration mode
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.message === 'success') {
            if (isRegistering) {
              alert('User created successfully! Please sign in to access the dashboard.');
              setIsRegistering(false);  // Switch back to login mode
              window.location.reload();
              // console.log('Navigating');
              // navigate('/');
              // console.log('Navigating Done');
            } else {
              localStorage.setItem('jwt-token', data.token);
              setUsername('');
              setPassword('');
              navigate('/dashboard');  // Redirect to dashboard after successful login
            }
          } else {
            alert(data.message);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
  }

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-5">
          {isRegistering ? 'Register' : 'Login'}
        </h1>
        <form onSubmit={submitUser}>
          <input
            value={username}
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <input
            value={password}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        {isRegistering && (
          <p className="text-center text-red-500 mt-4">
            Please click register and refresh.
          </p>
        )}
      </div>
    </main>
  );
}

