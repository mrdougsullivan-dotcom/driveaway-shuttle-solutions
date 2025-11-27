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

interface AdminPageProps {
  onBack?: () => void
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default function AdminPage({ onBack }: AdminPageProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    state: '',
    city: '',
    status: 'available' as 'available' | 'on_trip' | 'offline',
    vehicleType: '',
    serviceLocations: ''
  })

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/drivers`)
      const data = await response.json()
      // Backend returns {drivers: [...]}
      setDrivers(data.drivers || data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load drivers:', error)
      setLoading(false)
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingId(driver.id)
    setFormData({
      name: driver.name,
      phoneNumber: driver.phoneNumber || '',
      email: driver.email || '',
      state: driver.state,
      city: driver.city,
      status: driver.status,
      vehicleType: driver.vehicleType || '',
      serviceLocations: driver.serviceLocations ? JSON.parse(driver.serviceLocations).join(', ') : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': 'admin2025'
        }
      })

      if (!response.ok) {
        throw new Error('Unauthorized or failed to delete')
      }

      await loadDrivers()
      alert('Driver deleted successfully!')
    } catch (error) {
      console.error('Failed to delete driver:', error)
      alert('Failed to delete driver. Please check your admin access.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `${BACKEND_URL}/api/drivers/${editingId}`
        : `${BACKEND_URL}/api/drivers`

      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin2025'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Unauthorized or failed to save')
      }

      await loadDrivers()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        state: '',
        city: '',
        status: 'available',
        vehicleType: '',
        serviceLocations: ''
      })
      alert(editingId ? 'Driver updated!' : 'Driver added!')
    } catch (error) {
      console.error('Failed to save driver:', error)
      alert('Failed to save driver. Please check your admin access.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      state: '',
      city: '',
      status: 'available',
      vehicleType: '',
      serviceLocations: ''
    })
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
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Driveaway Shuttle Solutions Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="mt-2">Manage shuttle companies</p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium text-lg"
              >
                🔒 Lock Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Add New Company
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Company' : 'Add New Company'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="e.g., TX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    placeholder="e.g., Van, SUV"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Locations (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.serviceLocations}
                    onChange={(e) => setFormData({ ...formData, serviceLocations: e.target.value })}
                    placeholder="e.g., Houston, TX, Dallas, TX, Austin, TX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editingId ? 'Update Company' : 'Add Company'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drivers List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{driver.name}</div>
                    {driver.vehicleType && (
                      <div className="text-sm text-gray-500">{driver.vehicleType}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {driver.city}, {driver.state}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {driver.phoneNumber || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'available' ? 'bg-green-100 text-green-800' :
                      driver.status === 'on_trip' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {drivers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No companies yet. Click &quot;Add New Company&quot; to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
