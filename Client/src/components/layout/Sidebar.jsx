import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/',                  label: 'Dashboard'         },
  { to: '/patients',          label: 'Patients'          },
  { to: '/doctors',           label: 'Doctors'           },
  { to: '/appointments',      label: 'Appointments'      },
  { to: '/treatments',        label: 'Treatments'        },
  { to: '/reminders',         label: 'Reminders'         },
  { to: '/treatment-history', label: 'Treatment History' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">DentaCare CRM</p>
        <p className="text-xs text-gray-400 mt-0.5">Bangkok Dental Clinic</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'border-brand-500 bg-brand-50 text-brand-600 font-medium'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 truncate">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-gray-400 capitalize mb-3">{user?.role}</p>
        <button onClick={handleLogout} className="btn-secondary w-full text-xs py-1.5">
          Sign out
        </button>
      </div>
    </aside>
  );
}
