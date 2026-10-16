import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import BookCatalog from './pages/books/BookCatalog';
import BookDetail from './pages/books/BookDetail';
import BookForm from './pages/books/BookForm';
import MyBorrows from './pages/borrows/MyBorrows';
import AllBorrows from './pages/borrows/AllBorrows';
import MyFines from './pages/fines/MyFines';
import AllFines from './pages/fines/AllFines';
import Profile from './pages/profile/Profile';
import UserManagement from './pages/users/UserManagement';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Auth Pages — Login is now the primary entry point */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Application Layout & Pages (Pure Frontend — No Auth Guard Blockers) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<BookCatalog />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/add" element={<BookForm />} />
            <Route path="/books/edit/:id" element={<BookForm />} />
            <Route path="/my-borrows" element={<MyBorrows />} />
            <Route path="/borrows-history" element={<AllBorrows />} />
            <Route path="/all-borrows" element={<AllBorrows />} />
            <Route path="/my-fines" element={<MyFines />} />
            <Route path="/all-fines" element={<AllFines />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
