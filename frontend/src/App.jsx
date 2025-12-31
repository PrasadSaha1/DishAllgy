import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ForgotUsername from './pages/ForgotUsername';
import ForgotPassword from './pages/ForgotPassword';
import RedirectLoggedIn from './components/RedirectLoggedIn';
import RedirectLoggedOut from './components/RedirectLoggedOut';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ChangeUsername from './pages/ChangeUsername';
import ChangePassword from './pages/ChangePassword';
import AddEmail from './pages/AddEmail';
import ChangeEmail from './pages/ChangeEmail';
import RedirectEmailGiven from './components/RedirectEmailGiven';
import ResetPassword from './pages/ResetPassword';
import ContactUs from './pages/ContactUs';
import { ToastContainer } from 'react-toastify';
import SavedRecipes from './pages/SavedRecipes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
    <Routes>

      <Route path="/login" element={
        <RedirectLoggedIn>
          <Login />
        </RedirectLoggedIn>
      } />

      <Route path="/register" element={
        <RedirectLoggedIn>
          <Register />
        </RedirectLoggedIn>
      } />

      <Route path="/forgot_username" element={
        <RedirectLoggedIn>
          <ForgotUsername />
        </RedirectLoggedIn>
      } />

      <Route path="/forgot_password" element={
        <RedirectLoggedIn>
          <ForgotPassword />
        </RedirectLoggedIn>
      } />

      <Route path="/settings" element={
        <RedirectLoggedOut>
          <Settings />
        </RedirectLoggedOut>
      } />

      <Route path="/change_username" element={
        <RedirectLoggedOut>
          <ChangeUsername />
        </RedirectLoggedOut>
      } />
      
      <Route path="/change_password" element={
        <RedirectLoggedOut>
          <ChangePassword />
        </RedirectLoggedOut>
      } />

      <Route path="/saved_recipes" element={
        <RedirectLoggedOut>
          <SavedRecipes />
        </RedirectLoggedOut>
      } />

      <Route path="/add_email" element={
        <RedirectLoggedOut>
          <RedirectEmailGiven>
            <AddEmail />
          </RedirectEmailGiven>
        </RedirectLoggedOut>
      } />

      <Route path="/change_email" element={
        <RedirectLoggedOut>
          <ChangeEmail />
        </RedirectLoggedOut>
      } />

      <Route path="/contact_us" element={
        <RedirectLoggedOut>
          <ContactUs />
        </RedirectLoggedOut>
      } />

      <Route path="/reset_password/:uid/:token" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ToastContainer
        position="top-center"          // "top-left", "bottom-right", etc.
        autoClose={6000}             // Auto close after 3 seconds
        hideProgressBar={false}      // Show/hide the progress bar
        newestOnTop={false}          // Show latest toast on top
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        theme="light"                // "light" | "dark" | "colored"
      />
    </BrowserRouter>
  )
}

export default App
