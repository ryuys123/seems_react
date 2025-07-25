// src/routers/adminRoutes.js
import React from "react";
import { Route } from "react-router-dom";

import AdminDashboard from "../pages/admin/AdminDashboard";
import UserListPage from "../pages/admin/UserListPage";
import FaqAdminListPage from "../pages/admin/FaqAdminListPage";

const adminRoutes = [
  <Route path="/admindashboard" element={<AdminDashboard />} />,
  <Route path="/userlist" element={<UserListPage />} />,
  <Route path="/adminfaq" element={<FaqAdminListPage />} />,
];

export default adminRoutes;
