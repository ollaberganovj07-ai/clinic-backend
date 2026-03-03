import Layout from '../components/Layout';

function AdminDashboard() {
  const cards = [
    { title: 'User Management', desc: 'Manage users, roles, and permissions', icon: 'user-group', color: 'bg-primary-100 text-primary-600' },
    { title: 'System Settings', desc: 'Configure system options and preferences', icon: 'cog', color: 'bg-sky-100 text-sky-600' },
    { title: 'Reports & Analytics', desc: 'View system analytics and reports', icon: 'chart', color: 'bg-emerald-100 text-emerald-600' },
  ];

  const Icon = ({ name, className }) => {
    if (name === 'user-group') return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    );
    if (name === 'cog') return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    );
    if (name === 'chart') return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    );
    return null;
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500 mt-1">Full system access and management</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary-100 transition-all">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${card.color}`}>
                <Icon name={card.icon} className="w-6 h-6" />
              </div>
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
