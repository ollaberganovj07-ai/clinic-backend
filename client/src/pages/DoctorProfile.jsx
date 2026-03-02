import Layout from '../components/Layout';

function DoctorProfile() {
  return (
    <Layout title="Doctor Profile">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Doctor Profile</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-600">View and manage your schedule and availability slots.</p>
        </div>
      </div>
    </Layout>
  );
}

export default DoctorProfile;
