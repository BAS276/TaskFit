// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';



export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}