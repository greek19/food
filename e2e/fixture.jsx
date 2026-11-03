// Local browser-test entry: never included in the production build.
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App.jsx';
import { createFoodAuth } from '../src/auth.js';
import '../styles.css';

createRoot(document.getElementById('root')).render(<App auth={createFoodAuth({}, { demoAllowed: true })} />);
