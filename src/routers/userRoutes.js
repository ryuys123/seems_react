// src/routers/userRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import SignupPage from '../pages/user/SignupPage';
import PwFindPage from '../pages/user/PwFindPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserDashboard from '../pages/user/UserDashboard';

const userRoutes = [
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/pwfind',  
    element: <PwFindPage />
  },
  {
    path: '/userprofile',
    element: <UserProfilePage />
  },
  {
    path: '/userdashboard',
    element: <UserDashboard />
  }
];

export default userRoutes;