import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SRM Bus Booking System by Parth Singh',
  description: 'SRM Bus booking system for college sports teams by Parth Singh',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
          <header className="border-b bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
              {/* Header content removed */}
            </div>
          </header>
          <div className="flex-1">
            {children}
          </div>
          <footer className="border-t bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} SRM Bus Booking System by Parth Singh — rights reserved.
              <div className="mt-1">
                For queries/issues while booking: <a href="tel:9319734459" className="underline">9319734459</a> ·
                <a href="mailto:2005parthkumarsingh@gmail.com" className="underline ml-1">2005parthkumarsingh@gmail.com</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
