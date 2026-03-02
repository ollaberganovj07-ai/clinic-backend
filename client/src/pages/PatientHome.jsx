import Layout from '../components/Layout';

function PatientHome() {
  return (
    <Layout title="Patient Home">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Patient Home</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-600">View your appointments and browse doctors.</p>
        </div>
      </div>
    </Layout>
  );
}

export default PatientHome;
