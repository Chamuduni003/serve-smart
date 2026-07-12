import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Register from './pages/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import LearnMore from './pages/LearnMore';
import Navbar from './components/Navbar';
import ProviderRegister from './components/ProviderRegister';
import CompleteProfile from './pages/CompleteProfile';
import ProviderSearch from './components/ProviderSearch';
import SearchResults from './pages/SearchResults';
import MyBookings from './components/MyBookings';
import ProviderDashboard from './components/ProviderDashboard';
import Profile from './pages/Profile'; // 👈 ඔයා Profile.js එක හැදුවේ components ඇතුළේ නම් මෙහෙම import කරන්න




function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container pt-5 mt-5">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/provider-register" element={<ProviderRegister />} />
        </Route>

        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/search-providers" element={<ProviderSearch />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
