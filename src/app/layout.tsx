import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/styles/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HypeJobs - Smart Job Aggregator',
  description: 'Find your dream job with AI-powered job search and recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}