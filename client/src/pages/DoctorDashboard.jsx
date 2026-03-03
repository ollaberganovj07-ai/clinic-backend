import Layout from '../components/Layout';

function DoctorDashboard() {
  return (
    <Layout title="Doctor Dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Doctor Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage your schedule and appointments</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-semibold text-slate-800">My Schedule</h3>
            <p className="text-sm text-slate-500 mt-1">View and manage your availability slots</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="font-semibold text-slate-800">Appointments</h3>
            <p className="text-sm text-slate-500 mt-1">View today&apos;s and upcoming appointments</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DoctorDashboard;
