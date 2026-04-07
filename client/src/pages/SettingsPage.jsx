import PageWrapper from '../components/layout/PageWrapper'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  return (
    <PageWrapper title="Settings">
      <div className="max-w-xl space-y-4">
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input className="input-field" defaultValue={user?.name} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input className="input-field" defaultValue={user?.email} disabled />
            </div>
            <button className="btn-primary text-sm px-6 py-2.5">Save Changes</button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Budget Exceeded Alerts', defaultChecked: true },
              { label: 'Weekly Summary Email', defaultChecked: false },
              { label: 'AI Insight Notifications', defaultChecked: true },
            ].map(({ label, defaultChecked }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-700 peer-checked:bg-indigo-600 rounded-full transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}