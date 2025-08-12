import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import './services/api/interceptors';

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <div className="App">
                        <AppRoutes />
                    </div>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;