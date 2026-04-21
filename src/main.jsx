import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import i18n from './tools/i18n.js'
import './index.css'

import App from './App.jsx'
import theme from './theme'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <Notifications />
      <App />
    </MantineProvider>
  </BrowserRouter>,
)
