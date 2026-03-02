import Layout from '../components/Layout';

function AdminDashboard() {
  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'User Management', desc: 'Manage users and roles', icon: '👥' },
            { title: 'System Settings', desc: 'Configure system options', icon: '⚙️' },
            { title: 'Reports', desc: 'View analytics and reports', icon: '📊' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-slate-800">{card.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
