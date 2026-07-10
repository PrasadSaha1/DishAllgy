import React from 'react';
import '../styles/Base.css';
import { isAuthenticated } from '../components/checkAuth';

export default function Base({ children }) {
  const loggedIn = isAuthenticated();

  return (
    <div className="base-container">
      <header className="base-header">
        <div className="header-content">
          <h1 className="brand-title">DishAllgy</h1>
          <nav className="nav-links">
            <a href="/">Home</a>

            {loggedIn ? (
              <>
                <a href="/settings">Settings</a>
                <a href="/saved_recipes">Saved Recipes</a>
              </>
            ) : (
              <>
                <a href="/register">Create an Account</a>
                <a href="/login">Log in</a>
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