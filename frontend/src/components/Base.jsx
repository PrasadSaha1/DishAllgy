import React from 'react';
import '../styles/Base.css'; // make sure this path is correct

export default function Base({ children }) {
  return (
    <div className="base-container">
      <header className="base-header">
        <div className="header-content">
          <h1 className="brand-title">Dish Allergen Search Portal</h1>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/settings">Settings</a>
            <a href="/saved_recipes">Saved Recipes</a>
          </nav>
        </div>
      </header>

      <main className="base-main container">
        {children}
      </main>

      <footer className="base-footer">
        <p className="mb-0">&copy; 2025 Website Inc.</p>
      </footer>
    </div>
  );
}
