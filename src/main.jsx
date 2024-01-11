import React from 'react'
import ReactDOM from 'react-dom/client'

import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="779252330482-6l6e8p1k9m87r3n8c2hejpnjgguke9gc.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>,
)
