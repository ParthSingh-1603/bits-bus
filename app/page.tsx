'use client'

import { useState, useEffect } from 'react'
import { Bus, User, Users, Trophy, GraduationCap } from 'lucide-react'
import { supabase, Booking, Seat } from '@/lib/supabase'
import BookingForm from '@/components/BookingForm'
import BusLayout from '@/components/BusLayout'
import SeatLegend from '@/components/SeatLegend'

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSeats: 54,
    bookedSeats: 0,
    availableSeats: 54,
    cricketMale: 0,
    volleyballMale: 0,
    volleyballFemale: 0,
    basketballMale: 0,
    basketballFemale: 0,
    faculty: 0,
    eightBallPool: 0,
  })

  useEffect(() => {
    loadSeats()
  }, [])

  const loadSeats = async () => {
    try {
      setLoading(true)
      
      // Initialize seats array
      const seatsArray: Seat[] = Array.from({ length: 54 }, (_, i) => ({
        seat_number: i + 1,
        is_booked: false,
      }))

      // Fetch existing bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('seat_number')

      if (error) {
        console.error('Error loading bookings:', error)
        return
      }

      // Update seats with booking information
      bookings?.forEach((booking: Booking) => {
        const seatIndex = booking.seat_number - 1
        if (seatIndex >= 0 && seatIndex < seatsArray.length) {
          seatsArray[seatIndex] = {
            ...seatsArray[seatIndex],
            is_booked: true,
            booking,
          }
        }
      })

      setSeats(seatsArray)
      calculateStats(seatsArray)
    } catch (error) {
      console.error('Error loading seats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (seatsArray: Seat[]) => {
    const stats = {
      totalSeats: 54,
      bookedSeats: 0,
      availableSeats: 54,
      cricketMale: 0,
      volleyballMale: 0,
      volleyballFemale: 0,
      basketballMale: 0,
      basketballFemale: 0,
      faculty: 0,
      eightBallPool: 0,
    }

    seatsArray.forEach(seat => {
      if (seat.is_booked && seat.booking) {
        stats.bookedSeats++
        stats.availableSeats--
        
        switch (seat.booking.sport) {
          case 'cricket':
            if (seat.booking.gender === 'male') stats.cricketMale++
            break
          case 'volleyball':
            if (seat.booking.gender === 'male') stats.volleyballMale++
            else stats.volleyballFemale++
            break
          case 'basketball':
            if (seat.booking.gender === 'male') stats.basketballMale++
            else stats.basketballFemale++
            break
          case '8ballpool':
            stats.eightBallPool++
            break
          case 'faculty':
            stats.faculty++
            break
        }
      }
    })

    setStats(stats)
  }

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats?.[seatNumber - 1]
    if (!seat) return
    if (!seat.is_booked) {
      setSelectedSeat(seatNumber)
      setShowBookingForm(true)
    }
  }

  const [bookingConfirmation, setBookingConfirmation] = useState<{
    studentName: string;
    seatNumber: number;
    sport: string;
    gender: string;
    seatLabel: string;
  } | null>(null)

  // Removed unused getSeatLabel function - seat labels are now handled in BusLayout component

  const handleBookingComplete = (bookingDetails: {
    studentName: string;
    seatNumber: number;
    sport: string;
    gender: string;
    seatLabel: string;
  }) => {
    setSelectedSeat(null)
    setShowBookingForm(false)
    setBookingConfirmation(bookingDetails)
    loadSeats() // Reload seats to show updated state
  }

  const handleDownloadTicket = () => {
    if (!bookingConfirmation) return
    const { studentName, seatNumber, sport, gender, seatLabel } = bookingConfirmation

    const canvas = document.createElement('canvas')
    const width = 900
    const height = 500
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 32px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ctx.fillText('SRM Bus Booking - Ticket', 30, 60)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(30, 80)
    ctx.lineTo(width - 30, 80)
    ctx.stroke()

    ctx.font = '600 22px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ctx.fillText(`Name:`, 30, 130)
    ctx.fillText(`Seat:`, 30, 170)
    ctx.fillText(`Sport Team:`, 30, 210)
    ctx.fillText(`Gender:`, 30, 250)
    ctx.fillText(`Seat Label:`, 30, 290)
    ctx.fillText(`Issued:`, 30, 330)

    ctx.font = '400 22px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ctx.fillText(studentName, 180, 130)
    ctx.fillText(`#${seatNumber}`, 180, 170)
    ctx.fillText(String(sport).toUpperCase(), 180, 210)
    ctx.fillText(String(gender).toUpperCase(), 180, 250)
    ctx.fillText(seatLabel, 180, 290)
    ctx.fillText(new Date().toLocaleString(), 180, 330)

    ctx.font = 'italic 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('Please present this ticket during boarding.', 30, height - 40)

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `ticket-seat-${seatNumber}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading bus layout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bus className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-800">SRM Bus Booking System</h1>
        </div>
        <p className="text-lg text-gray-600">Book your seat for the sports tournament by Parth Singh</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Seats</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalSeats}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <User className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl font-bold text-green-600">{stats.availableSeats}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Booked</p>
              <p className="text-xl font-bold text-purple-600">{stats.bookedSeats}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Faculty Available</p>
              <p className="text-xl font-bold text-orange-600">{Math.max(0, 3 - stats.faculty)}/3</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Sports Teams</p>
              <p className="text-xl font-bold text-red-600">{stats.bookedSeats - stats.faculty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Team Allocations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-800">Cricket (Male)</p>
            <p className="text-2xl font-bold text-blue-600">{stats.cricketMale}/14</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-800">Volleyball (Male)</p>
            <p className="text-2xl font-bold text-green-600">{stats.volleyballMale}/11</p>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <p className="font-semibold text-pink-800">Volleyball (Female)</p>
            <p className="text-2xl font-bold text-pink-600">{stats.volleyballFemale}/12</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="font-semibold text-orange-800">Basketball (Male)</p>
            <p className="text-2xl font-bold text-orange-600">{stats.basketballMale}/5</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="font-semibold text-purple-800">Basketball (Female)</p>
            <p className="text-2xl font-bold text-purple-600">{stats.basketballFemale}/8</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="font-semibold text-indigo-800">8 Ball Pool Available</p>
            <p className="text-2xl font-bold text-indigo-600">{Math.max(0, 1 - stats.eightBallPool)}/1</p>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Bus Layout</h2>
        <BusLayout 
          seats={seats} 
          onSeatClick={handleSeatClick}
          selectedSeat={selectedSeat}
        />
        <SeatLegend />
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedSeat && (
        <BookingForm
          seatNumber={selectedSeat}
          onClose={() => setShowBookingForm(false)}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Booking Confirmation Popup */}
      {bookingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600">Your seat has been successfully booked.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">{bookingConfirmation.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seat</p>
                  <p className="font-semibold text-gray-800">{bookingConfirmation.seatLabel} (#{bookingConfirmation.seatNumber})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sport Team</p>
                  <p className="font-semibold text-gray-800 capitalize">{bookingConfirmation.sport}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold text-gray-800 capitalize">{bookingConfirmation.gender}</p>
                </div>
              </div>
            </div>

            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Please take a screenshot of this confirmation for verification at boarding.
            </div>

            <button
              onClick={handleDownloadTicket}
              className="w-full mb-3 bg-white text-blue-600 border border-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Download Ticket (PNG)
            </button>

            <button
              onClick={() => setBookingConfirmation(null)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
