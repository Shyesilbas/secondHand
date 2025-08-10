import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './services/api/interceptors';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;