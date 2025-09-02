'use client'

import { Seat } from '@/lib/supabase'
import { Bus, Armchair } from 'lucide-react'

interface BusLayoutProps {
  seats: Seat[]
  onSeatClick: (seatNumber: number) => void
  selectedSeat: number | null
}

export default function BusLayout({ seats, onSeatClick, selectedSeat }: BusLayoutProps) {
  // Custom 54-seat layout without A row:
  // B–I = 2(left)+0(middle)+3(right) → 8 rows × 5 = 40
  // J, K = 3(left)+1(middle)+3(right) → 2 rows × 7 = 14
  // Total = 54
  const rowDefinitions: Array<{ label: string; left: number; middle: number; right: number }> = [
    { label: 'A', left: 0, middle: 0, right: 3 }, // Front row: 01, 02, 03
    { label: 'B', left: 2, middle: 0, right: 3 },
    { label: 'C', left: 2, middle: 0, right: 3 },
    { label: 'D', left: 2, middle: 0, right: 3 },
    { label: 'E', left: 2, middle: 0, right: 3 },
    { label: 'F', left: 2, middle: 0, right: 3 },
    { label: 'G', left: 2, middle: 0, right: 3 },
    { label: 'H', left: 2, middle: 0, right: 3 },
    { label: 'I', left: 2, middle: 0, right: 3 },
    { label: 'J', left: 2, middle: 0, right: 3 },
    { label: 'K', left: 2, middle: 0, right: 4 }, // Last row: 4 seats on right
  ]
  // Total seats calculated dynamically from row definitions

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

        {/* Passenger seats per row definitions */}
        <div className="space-y-4">
          {(() => {
            let runningSeatNumber = 0
            return rowDefinitions.map((row) => {
              const { label, left, middle, right } = row
              let rowSeatIndex = 0
              return (
                <div key={label} className="flex justify-center items-center">
                  {/* Row label */}
                  <div className="w-8 mr-2 text-right text-sm font-semibold text-gray-600 select-none">
                    {label}
                  </div>

                  {/* Left block */}
                  <div className="flex gap-4">
                    {Array.from({ length: left }, () => {
                      const seatNumber = ++runningSeatNumber
                      const seat = seats?.[seatNumber - 1]
                      const seatLabel = `${label}${++rowSeatIndex}`
                      return (
                        <div
                          key={seatNumber}
                          className={getSeatClass(seat, seatNumber) + ' relative'}
                          onClick={() => onSeatClick(seatNumber)}
                          title={seat?.is_booked ? `${seat.booking?.student_name} (${seat.booking?.sport})` : `Seat ${seatLabel} - Available`}
                        >
                          <Armchair className="h-6 w-6" />
                          <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-white/80 text-gray-800 px-1 rounded">
                            {seatLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Aisle with optional middle seat */}
                  <div className="w-10 mx-2 flex justify-center">
                    {middle === 1 && (
                      (() => {
                        const seatNumber = ++runningSeatNumber
                        const seat = seats?.[seatNumber - 1]
                        const seatLabel = `${label}${++rowSeatIndex}`
                        return (
                          <div
                            key={seatNumber}
                            className={getSeatClass(seat, seatNumber) + ' relative'}
                            onClick={() => onSeatClick(seatNumber)}
                            title={seat?.is_booked ? `${seat.booking?.student_name} (${seat.booking?.sport})` : `Seat ${seatLabel} - Available`}
                          >
                            <Armchair className="h-6 w-6" />
                            <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-white/80 text-gray-800 px-1 rounded">
                              {seatLabel}
                            </span>
                          </div>
                        )
                      })()
                    )}
                  </div>

                  {/* Right block */}
                  <div className="flex gap-4">
                    {Array.from({ length: right }, () => {
                      const seatNumber = ++runningSeatNumber
                      const seat = seats?.[seatNumber - 1]
                      const seatLabel = `${label}${++rowSeatIndex}`
                      return (
                        <div
                          key={seatNumber}
                          className={getSeatClass(seat, seatNumber) + ' relative'}
                          onClick={() => onSeatClick(seatNumber)}
                          title={seat?.is_booked ? `${seat.booking?.student_name} (${seat.booking?.sport})` : `Seat ${seatLabel} - Available`}
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
            })
          })()}
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
