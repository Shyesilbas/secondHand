import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ui/Toast';
import './services/api/interceptors';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <div className="App">
                        <AppRoutes />
                        <ToastContainer />
                    </div>
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;