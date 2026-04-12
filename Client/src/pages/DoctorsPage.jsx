import { useState } from 'react';
import { doctorsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = { full_name:'', gender:'', phone:'', email:'', speciality:'' };
const SPECIALITIES = [
  'General Dentistry','Endodontics','Orthodontics',
  'Periodontics','Oral Surgery','Pediatric Dentistry','Prosthodontics',
];

function DoctorForm({ form, onChange, error, loading, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Alert type="error" message={error} />
      <div>
        <label className="label">Full name *</label>
        <input name="full_name" required value={form.full_name} onChange={onChange} className="input" placeholder="Dr. Wanchai Arunrat" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Gender</label>
          <select name="gender" value={form.gender} onChange={onChange} className="input">
            <option value="">— select —</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="label">Speciality</label>
          <select name="speciality" value={form.speciality} onChange={onChange} className="input">
            <option value="">— select —</option>
            {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="input" placeholder="0812000001" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} className="input" placeholder="dr@dentacare.th" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save doctor'}
        </button>
      </div>
    </form>
  );
}

function AppointmentsModal({ doctor, onClose }) {
  const { data, loading, error } = useFetch(() => doctorsService.getAppointments(doctor.id), [doctor.id]);
  return (
    <Modal open onClose={onClose} title={`Appointments — ${doctor.full_name}`} width="max-w-2xl">
      {loading && <PageSpinner />}
      {error   && <Alert message={error} />}
      {data && !data.length && <p className="text-sm text-gray-400 text-center py-8">No appointments found.</p>}
      {data?.length > 0 && (
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Date & time','Patient','Treatment','Status'].map(h => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(a => (
              <tr key={a.id}>
                <td className="table-td text-xs text-gray-500">
                  {new Date(a.scheduled_at).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}
                </td>
                <td className="table-td font-medium">{a.patient_name}</td>
                <td className="table-td text-gray-500">{a.treatment_name ?? '—'}</td>
                <td className="table-td"><Badge value={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

export default function DoctorsPage() {
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { data, loading, error, refetch } = useFetch(() => doctorsService.getAll());

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const openAdd  = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit = (d) => { setSelected(d); setForm({ ...EMPTY_FORM, ...d }); setFormErr(''); setModal('edit'); };
  const openApts = (d) => { setSelected(d); setModal('appointments'); };
  const openDel  = (d) => { setSelected(d); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      if (modal === 'add') await doctorsService.create(form);
      else                 await doctorsService.update(selected.id, form);
      await refetch(); closeModal();
    } catch (err) { setFormErr(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await doctorsService.remove(selected.id); await refetch(); closeModal(); }
    catch { /* ignore */ } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={data ? `${data.length} staff members` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ Add doctor</button>}
      />

      <div className="p-8">
        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No doctors found." action={<button onClick={openAdd} className="btn-primary">Add first doctor</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name','Speciality','Phone','Email',''].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td font-medium text-gray-900">{d.full_name}</td>
                        <td className="table-td"><span className="badge-blue">{d.speciality ?? '—'}</span></td>
                        <td className="table-td">{d.phone ?? '—'}</td>
                        <td className="table-td text-gray-500">{d.email ?? '—'}</td>
                        <td className="table-td">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openApts(d)} className="btn-secondary text-xs py-1 px-2">Appointments</button>
                            <button onClick={() => openEdit(d)} className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDel(d)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}
      </div>

      <Modal open={modal==='add'||modal==='edit'} onClose={closeModal}
        title={modal==='add' ? 'Add doctor' : 'Edit doctor'}>
        <DoctorForm form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal} />
      </Modal>

      {modal==='appointments' && selected && (
        <AppointmentsModal doctor={selected} onClose={closeModal} />
      )}

      <ConfirmDialog open={modal==='delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete doctor"
        message={`Remove ${selected?.full_name} from the system? Their appointment records will remain.`}
      />
    </div>
  );
}
