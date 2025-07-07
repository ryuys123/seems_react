// src/routers/userRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import SignupPage from '../pages/user/SignupPage';
import PwFindPage from '../pages/user/PwFindPage';
import UserProfilePage from '../pages/user/UserProfilePage';

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
  }
];

export default userRoutes;