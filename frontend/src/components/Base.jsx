import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Base.css';
import { isAuthenticated } from '../components/checkAuth';

export default function Base({ children }) {
  const loggedIn = isAuthenticated();

  return (
    <div className="base-container">
      <header className="base-header">
        <div className="header-content">
            DishAllgy

          <nav className="nav-links">
            <Link to="/">Home</Link>

            {loggedIn ? (
              <>
                <Link to="/settings">Settings</Link>
                <Link to="/saved_recipes">Saved Recipes</Link>
              </>
            ) : (
              <>
                <Link to="/register">Create an Account</Link>
                <Link to="/login">Log in</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="base-main container">
        {children}
      </main>

      <footer className="base-footer">
        <p className="mb-0">&copy; 2026 DishAllgy</p>
      </footer>
    </div>
  );
}