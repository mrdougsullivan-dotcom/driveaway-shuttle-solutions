import { useState, useEffect } from 'react'

interface Driver {
  id: string
  name: string
  phoneNumber: string | null
  email: string | null
  state: string
  city: string
  status: 'available' | 'on_trip' | 'offline'
  vehicleType: string | null
  serviceLocations: string | null
}

interface DistanceResult {
  distance: number
  duration: string
  fromCity: string
  toCity: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// Clean public-facing app - no admin access
function App() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)
  const [dropOffCity, setDropOffCity] = useState('')
  const [pickupCity, setPickupCity] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null)
  const [calculatorError, setCalculatorError] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/drivers`)
      const data = await response.json()
      // Backend returns {drivers: [...]}
      setDrivers(data.drivers || data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
      setLoading(false)
    }
  }

  // Get unique states
  const states = Array.from(new Set(drivers.map(d => d.state))).sort()

  // Get cities for selected state
  const cities = selectedState
    ? Array.from(new Set(drivers.filter(d => d.state === selectedState).map(d => d.city))).sort()
    : []

  // Filter drivers by selected state and city
  const filteredDrivers = drivers.filter(driver => {
    if (selectedState && driver.state !== selectedState) return false
    if (selectedCity && driver.city !== selectedCity) return false
    return true
  })

  const getServiceLocations = (serviceLocations: string | null): string[] => {
    if (!serviceLocations) return []
    try {
      return JSON.parse(serviceLocations)
    } catch {
      return []
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'on_trip': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const calculateDistance = async () => {
    if (!dropOffCity.trim() || !pickupCity.trim()) {
      setCalculatorError('Please enter both cities')
      return
    }

    setCalculating(true)
    setCalculatorError('')
    setDistanceResult(null)

    try {
      const fromCoords = await geocodeCity(dropOffCity)
      const toCoords = await geocodeCity(pickupCity)

      if (!fromCoords || !toCoords) {
        setCalculatorError('Could not find one or both cities. Please check spelling and include state (e.g., "Macungie, PA")')
        setCalculating(false)
        return
      }

      const distance = haversineDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
      const hours = Math.floor(distance / 60)
      const minutes = Math.round((distance / 60 - hours) * 60)
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

      setDistanceResult({
        distance: Math.round(distance),
        duration,
        fromCity: dropOffCity,
        toCity: pickupCity
      })
    } catch (err) {
      setCalculatorError('Error calculating distance. Please try again.')
    } finally {
      setCalculating(false)
    }
  }

  const geocodeCity = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'DriveawayShuttleSolutions/1.0'
          }
        }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180)
  }

  const clearCalculator = () => {
    setDropOffCity('')
    setPickupCity('')
    setDistanceResult(null)
    setCalculatorError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Background Image */}
      <div
        className="bg-white border-b sticky top-0 z-10 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/shuttle-bus.jpeg)' }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/85"></div>

        <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Driveaway Shuttle Solutions Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Driveaway Shuttle Solutions</h1>
              <p className="text-gray-700 text-lg font-medium">Find transportation companies across the US - 56 Companies in 27 States</p>
            </div>
          </div>
        </div>
      </div>

      {/* State and City Pickers */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Distance Calculator Button */}
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full mb-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all"
        >
          <span className="text-xl">🧮 Distance Calculator</span>
          <span className="ml-2">{showCalculator ? '▲' : '▼'}</span>
        </button>

        {/* Distance Calculator Section */}
        {showCalculator && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calculate Distance</h2>
            <p className="text-gray-600 mb-6">Calculate distance from your vehicle drop-off location to shuttle pickup location</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Drop-off Location */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  📍 Drop-off Location
                </label>
                <input
                  type="text"
                  value={dropOffCity}
                  onChange={(e) => setDropOffCity(e.target.value)}
                  placeholder="e.g., Macungie, PA"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">Where you&apos;re delivering the vehicle</p>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  🚗 Shuttle Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  placeholder="e.g., Hollidaysburg, PA"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">Where shuttle drivers are located</p>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex gap-4">
              <button
                onClick={calculateDistance}
                disabled={calculating}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md"
              >
                {calculating ? 'Calculating...' : '🧮 Calculate Distance'}
              </button>
              {(dropOffCity || pickupCity || distanceResult) && (
                <button
                  onClick={clearCalculator}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Error Message */}
            {calculatorError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{calculatorError}</p>
              </div>
            )}

            {/* Distance Result */}
            {distanceResult && (
              <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
                <h3 className="text-white text-xl font-bold mb-4">Distance Result:</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-white/80 text-sm mb-1">From:</p>
                    <p className="text-white font-bold text-lg">{distanceResult.fromCity}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-white/80 text-sm mb-1">To:</p>
                    <p className="text-white font-bold text-lg">{distanceResult.toCity}</p>
                  </div>
                </div>

                <div className="bg-white/30 rounded-lg p-6 text-center">
                  <p className="text-white text-6xl font-bold mb-2">{distanceResult.distance}</p>
                  <p className="text-white text-2xl font-semibold mb-3">miles</p>
                  <p className="text-white text-lg">Est. driving time: {distanceResult.duration}</p>
                </div>

                <p className="text-white/80 text-sm text-center mt-4">
                  * Distance is calculated as the crow flies. Actual driving distance may vary.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Location</h2>

          {/* State Picker */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              1. Choose Your State
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value)
                setSelectedCity('') // Reset city when state changes
              }}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select a state...</option>
              {states.map(state => (
                <option key={state} value={state}>
                  {state} ({drivers.filter(d => d.state === state).length} companies)
                </option>
              ))}
            </select>
          </div>

          {/* City Picker - Only show if state is selected */}
          {selectedState && cities.length > 0 && (
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                2. Choose Your City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="">All cities in {selectedState}</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city} ({drivers.filter(d => d.state === selectedState && d.city === city).length} companies)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Button */}
          {selectedState && (
            <button
              onClick={() => {
                setSelectedState('')
                setSelectedCity('')
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Results */}
        {selectedState ? (
          <div>
            <div className="mb-6 text-xl font-semibold text-gray-800">
              {filteredDrivers.length} {filteredDrivers.length === 1 ? 'Company' : 'Companies'} Found
              {selectedCity && ` in ${selectedCity}, ${selectedState}`}
              {!selectedCity && ` in ${selectedState}`}
            </div>

            {/* Simple List of Companies */}
        <div className="space-y-4">
          {filteredDrivers.map((driver) => {
            const serviceLocations = getServiceLocations(driver.serviceLocations)

            return (
              <div key={driver.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(driver.status)}`} title={driver.status}></div>
                    </div>
                    <p className="text-lg text-gray-600">{driver.city}, {driver.state}</p>
                  </div>
                </div>

                {/* Contact Info - Large and Easy to Click */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {driver.phoneNumber && (
                    <a
                      href={`tel:${driver.phoneNumber}`}
                      className="flex items-center gap-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="text-lg font-semibold text-blue-600">{driver.phoneNumber}</div>
                      </div>
                    </a>
                  )}

                  {driver.email && (
                    <a
                      href={`mailto:${driver.email}`}
                      className="flex items-center gap-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="text-lg font-semibold text-blue-600 truncate">{driver.email}</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  {driver.vehicleType && (
                    <div className="text-gray-700">
                      <span className="font-medium">Vehicle:</span> {driver.vehicleType}
                    </div>
                  )}

                  {serviceLocations.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Service Areas:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {serviceLocations.map((location, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-600">
              No companies found in {selectedCity ? `${selectedCity}, ${selectedState}` : selectedState}
            </p>
          </div>
        )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-2xl text-gray-600">Select a state above to find shuttle companies</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white mt-16 py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p className="text-lg">Driveaway Shuttle Solutions © 2025 - Doug S.</p>
          <p className="mt-2 text-sm">Simple, fast, and easy to use</p>
        </div>
      </div>
    </div>
  )
}

export default App
