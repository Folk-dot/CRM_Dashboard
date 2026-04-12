import { useFetch } from '../hooks/useFetch.js';
import { appointmentsService, remindersService, patientsService } from '../services/index.js';
import { Badge, PageSpinner, Alert } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

function MetricCard({ label, value, sub, danger }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${danger ? 'text-red-500' : 'text-gray-900'}`}>{value ?? '—'}</p>
      {sub && <p className={`text-xs mt-1 ${danger ? 'text-red-400' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const today       = useFetch(() => appointmentsService.getToday());
  const overdue     = useFetch(() => remindersService.getOverdue());
  const patients    = useFetch(() => patientsService.getAll());

  const overdueCount   = overdue.data?.length ?? 0;
  const todayCount     = today.data?.length ?? 0;
  const remainingToday = today.data?.filter(a => a.status === 'Upcoming').length ?? 0;
  const totalPatients  = patients.data?.length ?? 0;

  if (today.loading && overdue.loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
      />

      <div className="p-8 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total patients"        value={totalPatients} sub="in database" />
          <MetricCard label="Today's appointments"  value={todayCount}   sub={`${remainingToday} remaining`} />
          <MetricCard label="Overdue reminders"     value={overdueCount} sub="need follow-up" danger={overdueCount > 0} />
          <MetricCard label="Active today"          value={today.data?.filter(a=>a.status==='In progress').length ?? 0} sub="in progress" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's schedule */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Today's schedule</h2>
            </div>
            {today.error && <Alert message={today.error} />}
            {!today.data?.length
              ? <p className="text-sm text-gray-400 px-5 py-8 text-center">No appointments today</p>
              : <table className="w-full">
                  <tbody>
                    {today.data.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 last:border-0">
                        <td className="table-td w-20 text-gray-400 text-xs">
                          {new Date(a.scheduled_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                        </td>
                        <td className="table-td">
                          <p className="font-medium text-gray-800 text-sm">{a.patient_name}</p>
                          <p className="text-xs text-gray-400">{a.treatment_name ?? 'No treatment set'}</p>
                        </td>
                        <td className="table-td text-right"><Badge value={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          {/* Overdue reminders */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Overdue reminders</h2>
            </div>
            {overdue.error && <Alert message={overdue.error} />}
            {!overdue.data?.length
              ? <p className="text-sm text-gray-400 px-5 py-8 text-center">No overdue reminders</p>
              : <table className="w-full">
                  <tbody>
                    {overdue.data.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0">
                        <td className="table-td">
                          <p className="font-medium text-gray-800 text-sm">{r.patient_name}</p>
                          <p className="text-xs text-gray-400">{r.topic}</p>
                        </td>
                        <td className="table-td text-right text-xs text-red-400">
                          {new Date(r.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
