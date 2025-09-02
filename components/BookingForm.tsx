'use client'

import { useState, useEffect } from 'react'
import { X, User, GraduationCap, Trophy, AlertCircle } from 'lucide-react'
import { supabase, Booking } from '@/lib/supabase'

interface BookingFormProps {
  seatNumber: number
  onClose: () => void
  onComplete: (bookingDetails: {
    studentName: string;
    seatNumber: number;
    sport: string;
    gender: string;
    seatLabel: string;
  }) => void
}

interface TeamLimits {
  cricketMale: number
  volleyballMale: number
  volleyballFemale: number
  basketballMale: number
  basketballFemale: number
  faculty: number
  eightBallPool: number
}

export default function BookingForm({ seatNumber, onClose, onComplete }: BookingFormProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    collegeRegNo: '',
    gender: 'male' as 'male' | 'female',
    sport: 'cricket' as 'cricket' | 'volleyball' | 'basketball' | 'faculty' | '8ballpool'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [teamLimits, setTeamLimits] = useState<TeamLimits>({
    cricketMale: 0,
    volleyballMale: 0,
    volleyballFemale: 0,
    basketballMale: 0,
    basketballFemale: 0,
    faculty: 0,
    eightBallPool: 0
  })

  useEffect(() => {
    loadTeamLimits()
  }, [])

  useEffect(() => {
    // Reset sport selection when gender changes to ensure valid options
    if (formData.gender === 'female') {
      if (formData.sport === 'cricket' || formData.sport === 'faculty') {
        setFormData(prev => ({ ...prev, sport: 'volleyball' }))
      }
    } else {
      // For male gender, volleyball and basketball are valid, so only reset if it's an invalid sport
      if (formData.sport === 'volleyball' || formData.sport === 'basketball') {
        // These sports are valid for both genders, so no need to change
        return
      }
      // For other cases, default to cricket
      setFormData(prev => ({ ...prev, sport: 'cricket' }))
    }
  }, [formData.gender])

  const getSeatLabel = (seatNumber: number) => {
    const rowIdx = Math.floor((seatNumber - 1) / 5)
    const rowLabel = String.fromCharCode(65 + rowIdx) // A, B, C...
    const seatInRow = seatNumber - (rowIdx * 5)
    
    // Handle K row which has 6 seats (3+3)
    if (rowLabel === 'K') {
      if (seatInRow <= 3) {
        return `K${seatInRow}`
      } else {
        return `K${seatInRow + 1}` // Skip the middle seat numbering
      }
    }
    
    return `${rowLabel}${seatInRow}`
  }

  const loadTeamLimits = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')

      if (error) {
        console.error('Error loading team limits:', error)
        return
      }

      const limits: TeamLimits = {
        cricketMale: 0,
        volleyballMale: 0,
        volleyballFemale: 0,
        basketballMale: 0,
        basketballFemale: 0,
        faculty: 0,
        eightBallPool: 0
      }

      bookings?.forEach((booking: Booking) => {
        switch (booking.sport) {
          case 'cricket':
            if (booking.gender === 'male') limits.cricketMale++
            break
          case 'volleyball':
            if (booking.gender === 'male') limits.volleyballMale++
            else limits.volleyballFemale++
            break
          case 'basketball':
            if (booking.gender === 'male') limits.basketballMale++
            else limits.basketballFemale++
            break
          case '8ballpool':
            limits.eightBallPool++
            break
          case 'faculty':
            limits.faculty++
            break
        }
      })

      setTeamLimits(limits)
    } catch (error) {
      console.error('Error loading team limits:', error)
    }
  }

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      setError('Please enter your full name')
      return false
    }

    // Registration number is required for students only (not for faculty)
    if (formData.sport !== 'faculty') {
      if (!formData.collegeRegNo.trim()) {
        setError('Please enter your college registration number')
        return false
      }

      // Validate college registration number format (allow 8-20 alphanumeric e.g., RA2211026030016)
      if (!/^[A-Za-z0-9]{8,20}$/.test(formData.collegeRegNo.trim())) {
        setError('Please enter a valid college registration number (8-20 characters, letters and numbers only)')
        return false
      }
    }

    // Disallow female bookings in rows H–J (seat numbers 36 and above in current layout)
    if (formData.gender === 'female' && seatNumber >= 36) {
      setError('Female bookings are not allowed in rows H–J. Please pick a seat in rows A–G.')
      return false
    }

    // Only faculty can book front row A1–A3 (seat numbers 1-3)
    if (seatNumber >= 1 && seatNumber <= 3 && formData.sport !== 'faculty') {
      setError('Front row seats A1–A3 are reserved for faculty only.')
      return false
    }

    // Check team limits
    const maxLimits = {
      cricketMale: 14,
      volleyballMale: 11,
      volleyballFemale: 12,
      basketballMale: 5,
      basketballFemale: 8,
      faculty: 3,
      eightBallPool: 1
    }

    const isFaculty = formData.sport === 'faculty'
    const currentCount = isFaculty
      ? (teamLimits.faculty || 0)
      : (teamLimits[`${formData.sport}${formData.gender === 'male' ? 'Male' : 'Female'}` as keyof TeamLimits] || 0)
    const maxCount = isFaculty
      ? 3
      : (maxLimits[`${formData.sport}${formData.gender === 'male' ? 'Male' : 'Female'}` as keyof TeamLimits] || 0)

    if (currentCount >= maxCount) {
      setError(`${formData.sport} team (${formData.gender}) is full. Please select another team.`)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {

      // Check if seat is still available
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('seat_number', seatNumber)
        .single()

      if (existingBooking) {
        setError('This seat has already been booked. Please select another seat.')
        setLoading(false)
        return
      }

      // No per-user restriction anymore

      // Create booking
      const { error } = await supabase
        .from('bookings')
        .insert({
          seat_number: seatNumber,
          student_name: formData.studentName.trim(),
          college_reg_no: (formData.sport === 'faculty' ? 'FACULTY' : formData.collegeRegNo.trim().toUpperCase()),
          gender: formData.gender,
          sport: formData.sport
        })

      if (error) {
        console.error('Error creating booking:', error)
        const msg = String(error?.message || '')
        const lower = msg.toLowerCase()
        if (lower.includes('team limit exceeded')) {
          setError('Selected team is full. Please choose another team.')
        } else if (lower.includes('seat') && lower.includes('already booked')) {
          setError('This seat has already been booked. Please select another seat.')
        } else if (lower.includes('row-level security')) {
          setError('Database security policy blocked the insert. Please run database/setup.sql policies in Supabase.')
        } else {
          setError(`Failed to create booking. Details: ${msg}`)
        }
        return
      }

      onComplete({
        studentName: formData.studentName.trim(),
        seatNumber: seatNumber,
        sport: formData.sport,
        gender: formData.gender,
        seatLabel: getSeatLabel(seatNumber)
      })
    } catch (error) {
      console.error('Error submitting booking:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTeamAvailability = (sport: string, gender: string) => {
    if (sport === 'faculty') {
      const current = teamLimits.faculty || 0
      const max = 3
      return { current, max, available: max - current }
    }
    if (sport === '8ballpool') {
      const current = teamLimits.eightBallPool || 0
      const max = 1
      return { current, max, available: max - current }
    }
    const key = `${sport}${gender === 'male' ? 'Male' : 'Female'}` as Exclude<keyof TeamLimits, 'faculty' | 'eightBallPool'>
    const current = teamLimits[key] || 0
    const maxMap: Record<Exclude<keyof TeamLimits, 'faculty' | 'eightBallPool'>, number> = {
      cricketMale: 14,
      volleyballMale: 11,
      volleyballFemale: 12,
      basketballMale: 5,
      basketballFemale: 8,
    }
    const max = maxMap[key] || 0

    return { current, max, available: max - current }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Book Seat {seatNumber}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* College Registration Number (hidden for faculty) */}
            {formData.sport !== 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 inline mr-1" />
                College Registration Number
              </label>
              <input
                type="text"
                value={formData.collegeRegNo}
                onChange={(e) => setFormData({ ...formData, collegeRegNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your college reg. no."
                required
              />
            </div>
            )}

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex space-x-6">
                <label className="flex items-center gap-2 text-gray-900">
                  <input
                    type="radio"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="accent-blue-600"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2 text-gray-900">
                  <input
                    type="radio"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="accent-pink-600"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            {/* Sport Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="h-4 w-4 inline mr-1" />
                Sport Team
              </label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value as 'cricket' | 'volleyball' | 'basketball' | 'faculty' | '8ballpool' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {formData.gender === 'male' ? (
                  <>
                                          <option value="cricket">Cricket (Male) - {getTeamAvailability('cricket', 'male').available}/14 available</option>
                      <option value="volleyball">Volleyball (Male) - {getTeamAvailability('volleyball', 'male').available}/11 available</option>
                                          <option value="basketball">Basketball (Male) - {getTeamAvailability('basketball', 'male').available}/5 available</option>
                    <option value="8ballpool">8 Ball Pool - {getTeamAvailability('8ballpool', 'male').available}/1 available</option>
                    <option value="faculty">Faculty - {getTeamAvailability('faculty', 'male').available}/3 available</option>
                  </>
                ) : (
                  <>
                    <option value="volleyball">Volleyball (Female) - {getTeamAvailability('volleyball', 'female').available}/12 available</option>
                    <option value="basketball">Basketball (Female) - {getTeamAvailability('basketball', 'female').available}/8 available</option>
                    <option value="8ballpool">8 Ball Pool - {getTeamAvailability('8ballpool', 'female').available}/1 available</option>
                  </>
                )}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
