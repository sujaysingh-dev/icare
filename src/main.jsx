
import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Toaster
                position="top-center"
                reverseOrder={true}
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px', background: "#333", color: "white"},
                }}
            />
            <App />
        </BrowserRouter>
    </StrictMode>,
)
