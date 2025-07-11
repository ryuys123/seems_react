// src/routers/userRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';

import SignupPage from '../pages/user/SignupPage';
import PwFindSelectPage from '../pages/user/PwFindSelectPage';
import PwFindIdPage from '../pages/user/PwFindIdPage';
import PwFindEmailPage from '../pages/user/PwFindEmailPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserDashboard from '../pages/user/UserDashboard';
import UserFormPage from '../pages/user/UserFormPage';
import UserPreferencePage from '../pages/user/UserPreferencePage';
import UserSimulationSettingsPage from '../pages/user/UserSimulationSettingsPage';
import UserDeletePage from '../pages/user/UserDeletePage';
import IdFindSelectPage from '../pages/user/IdFindSelectPage';
import IdFindPhonePage from '../pages/user/IdFindPhonePage';
import IdFindEmailPage from '../pages/user/IdFindEmailPage';

const userRoutes = [
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/pwfindselect',  
    element: <PwFindSelectPage />
  },
  {
    path: '/pwfindid',  
    element: <PwFindIdPage />
  },
  {
    path: '/pwfindemail',  
    element: <PwFindEmailPage />
  },
  {
    path: '/userprofile',
    element: <UserProfilePage />
  },
  {
    path: '/userdashboard',
    element: <UserDashboard />
  },
  {
    path: '/idfindselect',
    element: <IdFindSelectPage />
  },
  {
    path: '/idfindphone',
    element: <IdFindPhonePage />
  },
  {
    path: '/idfindemail',
    element: <IdFindEmailPage />
  },
  {
    path: '/userform',
    element: <UserFormPage />,
  },
  {
    path: '/user/preferences',
    element: <UserPreferencePage />,
  },
  {
    path: '/user/simulation-settings',
    element: <UserSimulationSettingsPage />,
  },
  {
    path: '/user/delete',
    element: <UserDeletePage />,
  },
];

export default userRoutes;