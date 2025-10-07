import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import Itinerary from './pages/Itinerary'
import Links from './pages/Links'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Home /> },
    { path: '/expenses', element: <Expenses /> },
    { path: '/itinerary', element: <Itinerary /> },
    { path: '/links', element: <Links /> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
