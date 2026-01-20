import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Get session_id from URL fragment
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        console.error('No session_id found in URL');
        navigate('/login');
        return;
      }

      try {
        // Exchange session_id for user data and set cookie
        const user = await login(sessionId);
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Redirect to home with user data
        navigate('/', { state: { user }, replace: true });
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3483FA] mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;