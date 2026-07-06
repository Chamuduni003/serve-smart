// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // User ලොග් වෙලාද බලන්න localStorage එකේ token එකක් තියෙනවද කියලා
    const isAuthenticated = localStorage.getItem('token'); 

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;