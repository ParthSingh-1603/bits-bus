export default function SeatLegend() {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Seat Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-seat-available rounded-lg border-2 border-gray-300 mr-3"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-seat-booked-male rounded-lg mr-3"></div>
          <span className="text-sm text-gray-700">Male Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-seat-booked-female rounded-lg mr-3"></div>
          <span className="text-sm text-gray-700">Female Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-seat-selected rounded-lg mr-3"></div>
          <span className="text-sm text-gray-700">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-800 rounded-lg mr-3"></div>
          <span className="text-sm text-gray-700">Driver Area</span>
        </div>
      </div>
    </div>
  )
}
