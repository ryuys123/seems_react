// src/routers/adminRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import AdminDashboard from '../pages/admin/AdminDashboard';

const adminRoutes = [
    {
        path: '/admindashboard',
        element: <AdminDashboard />
    }
];

export default adminRoutes;