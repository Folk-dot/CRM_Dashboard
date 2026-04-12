import { useState } from 'react';
import { patientsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = {
  full_name:'', date_of_birth:'', gender:'', phone:'',
  email:'', address:'', allergies:'', notes:'', status:'Active',
};
const STATUSES = ['Active','Inactive','Overdue','Follow-up'];
const GENDERS  = ['Male','Female','Other'];

function PatientForm({ form, onChange, error, loading, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Alert type="error" message={error} />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full name *</label>
          <input name="full_name" required value={form.full_name} onChange={onChange} className="input" placeholder="Somchai Wongkham" />
        </div>
        <div>
          <label className="label">Date of birth</label>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="label">Gender</label>
          <select name="gender" value={form.gender} onChange={onChange} className="input">
            <option value="">— select —</option>
            {GENDERS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="input" placeholder="0812345678" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} className="input" placeholder="patient@email.com" />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <input name="address" value={form.address} onChange={onChange} className="input" placeholder="12 Sukhumvit Rd, Bangkok" />
        </div>
        <div>
          <label className="label">Allergies</label>
          <input name="allergies" value={form.allergies} onChange={onChange} className="input" placeholder="None / Penicillin…" />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={onChange} className="input">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={onChange} className="input resize-none" placeholder="Additional notes…" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save patient'}
        </button>
      </div>
    </form>
  );
}

function HistoryModal({ patient, onClose }) {
  const { data, loading, error } = useFetch(() => patientsService.getHistory(patient.id), [patient.id]);
  return (
    <Modal open onClose={onClose} title={`History — ${patient.full_name}`} width="max-w-2xl">
      {loading && <PageSpinner />}
      {error   && <Alert message={error} />}
      {data && !data.length && <p className="text-sm text-gray-400 text-center py-8">No treatment history recorded.</p>}
      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((h) => (
            <div key={h.id} className="flex gap-4 pb-3 border-b border-gray-50 last:border-0">
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">{h.treatment_name ?? 'Treatment'}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{new Date(h.performed_at).toLocaleString('en-GB',{dateStyle:'short'})}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{h.doctor_name}</p>
                {h.notes     && <p className="text-xs text-gray-500 mt-1">{h.notes}</p>}
                {h.next_step && <p className="text-xs text-brand-600 mt-1">Next: {h.next_step}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function PatientsPage() {
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [modal,   setModal]   = useState(null); // 'add' | 'edit' | 'history' | 'delete'
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [formErr, setFormErr] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => patientsService.getAll({ search: search || undefined, status: status || undefined }),
    [search, status]
  );

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit = (p) => { setSelected(p); setForm({ ...EMPTY_FORM, ...p }); setFormErr(''); setModal('edit'); };
  const openHistory = (p) => { setSelected(p); setModal('history'); };
  const openDelete  = (p) => { setSelected(p); setModal('delete'); };
  const closeModal  = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErr('');
    try {
      if (modal === 'add') await patientsService.create(form);
      else                 await patientsService.update(selected.id, form);
      await refetch(); closeModal();
    } catch (err) {
      setFormErr(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await patientsService.remove(selected.id);
      await refetch(); closeModal();
    } catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={data ? `${data.length} records` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ Add patient</button>}
      />

      <div className="p-8">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="input max-w-xs" placeholder="Search name, email, phone…"
          />
          <select value={status} onChange={e => setStatus(e.target.value)} className="input w-40">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No patients found." action={<button onClick={openAdd} className="btn-primary">Add first patient</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Name','DOB','Phone','Email','Status',''].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td font-medium text-gray-900">{p.full_name}</td>
                        <td className="table-td text-gray-500">{new Date(p.date_of_birth).toLocaleString('en-GB',{dateStyle:'short'}) ?? '—'}</td>
                        <td className="table-td">{p.phone ?? '—'}</td>
                        <td className="table-td text-gray-500 max-w-[160px] truncate">{p.email ?? '—'}</td>
                        <td className="table-td"><Badge value={p.status} /></td>
                        <td className="table-td">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openHistory(p)} className="btn-secondary text-xs py-1 px-2">History</button>
                            <button onClick={() => openEdit(p)}    className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDelete(p)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
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

      {/* Add / Edit modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={closeModal}
        title={modal === 'add' ? 'Add patient' : 'Edit patient'} width="max-w-xl">
        <PatientForm form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal} />
      </Modal>

      {/* History modal */}
      {modal === 'history' && selected && (
        <HistoryModal patient={selected} onClose={closeModal} />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={modal === 'delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete patient"
        message={`Delete ${selected?.full_name}? This will also remove their appointments, reminders, and treatment history.`}
      />
    </div>
  );
}
