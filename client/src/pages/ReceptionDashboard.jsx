import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const SERVICES_KEY = 'hospital_services';

function loadServices() {
  try {
    const s = localStorage.getItem(SERVICES_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveServices(services) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

function ReceptionDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState(loadServices);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('doctors');

  // Book appointment form
  const [bookPatient, setBookPatient] = useState('');
  const [bookDoctor, setBookDoctor] = useState('');
  const [bookSlot, setBookSlot] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [booking, setBooking] = useState(false);

  // Service form
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        api.doctors.getAll(),
        api.auth.getPatients(),
        api.appointments.getAll(),
      ]);
      setDoctors(doctorsRes.data || []);
      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setDoctors([]);
      setPatients([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDoctorSlots(doctorId) {
    try {
      const res = await api.doctors.getById(doctorId);
      setSelectedDoctor(res.data);
      setSlots(res.data?.available_slots || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctor slots');
      setSlots([]);
    }
  }

  function handleAddService(e) {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice) return;
    const newService = {
      id: crypto.randomUUID(),
      name: serviceName.trim(),
      price: parseFloat(servicePrice),
    };
    const updated = editingService
      ? services.map((s) => (s.id === editingService.id ? { ...newService, id: s.id } : s))
      : [...services, newService];
    setServices(updated);
    saveServices(updated);
    setServiceName('');
    setServicePrice('');
    setEditingService(null);
  }

  function handleDeleteService(id) {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    saveServices(updated);
  }

  function handleEditService(service) {
    setServiceName(service.name);
    setServicePrice(service.price.toString());
    setEditingService(service);
  }

  async function handleBookAppointment(e) {
    e.preventDefault();
    if (!bookPatient || !bookSlot) return;
    setBooking(true);
    setError(null);
    try {
      await api.appointments.bookForPatient(bookPatient, bookSlot, bookReason);
      setBookPatient('');
      setBookDoctor('');
      setBookSlot('');
      setBookReason('');
      setSelectedDoctor(null);
      setSlots([]);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <Layout title="Reception Dashboard">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reception Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Reception Dashboard</h2>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-4">
            {['doctors', 'services', 'book', 'appointments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">All Doctors</h3>
              <p className="text-sm text-slate-500 mt-1">
                {doctors.length} doctor(s) • Click to view availability
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {doctors.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No doctors found</div>
              ) : (
                doctors.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{d.name}</p>
                      <p className="text-sm text-slate-500">{d.specialization}</p>
                    </div>
                    <button
                      onClick={() => fetchDoctorSlots(d.id)}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      View Slots
                    </button>
                  </div>
                ))
              )}
            </div>
            {selectedDoctor && slots.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">
                  Available slots: {selectedDoctor.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-sm text-slate-700"
                    >
                      {new Date(s.slot_time).toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Add / Edit Service</h3>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. Consultation"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Service Pricing</h3>
                <p className="text-sm text-slate-500 mt-1">{services.length} service(s)</p>
              </div>
              <div className="divide-y divide-slate-100">
                {services.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No services yet</div>
                ) : (
                  services.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-sm text-primary-600 font-medium">
                          ${s.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(s)}
                          className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl">
            <h3 className="font-semibold text-slate-800 mb-4">Book Appointment for Patient</h3>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Patient
                </label>
                <select
                  value={bookPatient}
                  onChange={(e) => setBookPatient(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Doctor
                </label>
                <select
                  value={bookDoctor}
                  onChange={(e) => {
                    const id = e.target.value;
                    setBookDoctor(id);
                    setBookSlot('');
                    if (id) fetchDoctorSlots(id);
                    else {
                      setSelectedDoctor(null);
                      setSlots([]);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
              {slots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Slot
                  </label>
                  <select
                    value={bookSlot}
                    onChange={(e) => setBookSlot(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose time slot...</option>
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.slot_time).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="e.g. Follow-up consultation"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={booking}
                className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">All Appointments</h3>
              <p className="text-sm text-slate-500 mt-1">{appointments.length} appointment(s)</p>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No appointments yet</div>
              ) : (
                appointments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {a.patient?.name || 'Unknown'} → {a.doctor?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {a.slot?.slot_time
                          ? new Date(a.slot.slot_time).toLocaleString()
                          : 'N/A'}{' '}
                        • {a.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ReceptionDashboard;
