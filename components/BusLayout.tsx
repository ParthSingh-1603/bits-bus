'use client'

import { Seat } from '@/lib/supabase'
import { Bus, Armchair } from 'lucide-react'

interface BusLayoutProps {
  seats: Seat[]
  onSeatClick: (seatNumber: number) => void
  selectedSeat: number | null
}

export default function BusLayout({ seats, onSeatClick, selectedSeat }: BusLayoutProps) {
  // 2 seats on the left, 3 on the right => 5 per row for A-J, 6 seats for K row (3+3)
  const totalSeats = 56
  const seatsPerRow = 5
  const numRows = 11 // A through K

  const getSeatClass = (seat: Seat | undefined, seatNumber: number) => {
    if (seatNumber === selectedSeat) {
      return 'bus-seat selected'
    }
    
    if (seat?.is_booked) {
      if (seat.booking?.sport === 'faculty') {
        return 'bus-seat booked-faculty'
      }
      return seat.booking?.gender === 'female' 
        ? 'bus-seat booked-female' 
        : 'bus-seat booked-male'
    }
    
    return 'bus-seat available'
  }

  const getSeatTooltip = (seat: Seat | undefined, seatNumber: number) => {
    if (seat?.is_booked && seat.booking) {
      return `${seat.booking.student_name} (${seat.booking.sport})`
    }
    
    return `Seat ${seatNumber} - Available`
  }

  return (
    <div className="relative">
      {/* Bus outline */}
      <div className="bg-gray-100 rounded-3xl p-8 border-4 border-gray-300">
        {/* Driver area label */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <Bus className="h-8 w-8 text-gray-600 mr-2" />
            <span className="text-lg font-semibold text-gray-700">Driver Area</span>
          </div>
        </div>

        {/* Passenger seats: 2 (left) + aisle + 3 (right) for A-J, 3+3 for K row */}
        <div className="space-y-4">
          {Array.from({ length: numRows }, (_, rowIdx) => {
            const rowStart = rowIdx * seatsPerRow + 1
            const rowLabel = String.fromCharCode(65 + rowIdx) // A, B, C...
            const isKRow = rowLabel === 'K'
            const leftSeats = isKRow ? 3 : 2
            const rightSeats = 3
            
            return (
              <div key={rowIdx} className="flex justify-center items-center">
                {/* Row label */}
                <div className="w-8 mr-2 text-right text-sm font-semibold text-gray-600 select-none">
                  {rowLabel}
                </div>
                {/* Left block: 2 seats for A-J, 3 seats for K */}
                <div className="flex gap-4">
                  {Array.from({ length: leftSeats }, (_, i) => {
                    const seatNumber = rowStart + i
                    if (seatNumber > totalSeats) return null
                    const seat = seats?.[seatNumber - 1]
                    const seatLabel = `${rowLabel}${i + 1}`
                    return (
                      <div
                        key={seatNumber}
                        className={getSeatClass(seat, seatNumber) + ' relative'}
                        onClick={() => onSeatClick(seatNumber)}
                        title={getSeatTooltip(seat, seatNumber)}
                      >
                        <Armchair className="h-6 w-6" />
                        <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-white/80 text-gray-800 px-1 rounded">
                          {seatLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Aisle spacer */}
                <div className="w-10" />

                {/* Right block: 3 seats */}
                <div className="flex gap-4">
                  {Array.from({ length: rightSeats }, (_, i) => {
                    const seatNumber = rowStart + leftSeats + i
                    if (seatNumber > totalSeats) return null
                    const seat = seats?.[seatNumber - 1]
                    const seatLabel = `${rowLabel}${leftSeats + i + 1}`
                    return (
                      <div
                        key={seatNumber}
                        className={getSeatClass(seat, seatNumber) + ' relative'}
                        onClick={() => onSeatClick(seatNumber)}
                        title={getSeatTooltip(seat, seatNumber)}
                      >
                        <Armchair className="h-6 w-6" />
                        <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-white/80 text-gray-800 px-1 rounded">
                          {seatLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bus front indicator */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          FRONT
        </div>
      </div>
    </div>
  )
}
