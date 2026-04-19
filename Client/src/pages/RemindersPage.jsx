import { useState } from 'react';
import { remindersService, patientsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = { patient_id:'', topic:'', due_date:'', status:'Upcoming', notes:'' };
const STATUSES   = ['Upcoming','Sent','Overdue','Appointed','Cancelled'];
const TOPICS     = [
  '6-month check-up','Annual X-ray','Post root canal follow-up',
  'Braces adjustment','Treatment review','Post extraction check',
  'Whitening follow-up','New patient 3-month check','Custom',
];

function ReminderForm({ form, onChange, error, loading, onSubmit, onClose, patients }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Alert type="error" message={error} />
      <div>
        <label className="label">Patient *</label>
        <select name="patient_id" required value={form.patient_id} onChange={onChange} className="input">
          <option value="">— select patient —</option>
          {patients?.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Topic</label>
          <select name="topic" value={form.topic} onChange={onChange} className="input">
            <option value="">— select —</option>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Due date *</label>
          <input name="due_date" type="date" required value={form.due_date} onChange={onChange} className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={onChange} className="input resize-none" placeholder="Additional notes…" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save reminder'}
        </button>
      </div>
    </form>
  );
}

export default function RemindersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => remindersService.getAll({ status: statusFilter || undefined }),
    [statusFilter]
  );
  const patients = useFetch(() => patientsService.getAll());

  const onChange   = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const openAdd    = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit   = (r) => { setSelected(r); setForm({ ...EMPTY_FORM, ...r }); setFormErr(''); setModal('edit'); };
  const openDel    = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      if (modal === 'add') await remindersService.create(form);
      else                 await remindersService.update(selected.id, form);
      await refetch(); closeModal();
    } catch (err) { setFormErr(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await remindersService.remove(selected.id); await refetch(); closeModal(); }
    catch { /* ignore */ } finally { setDeleting(false); }
  };

  // Status is computed by the backend based on due_date — just use r.status directly
  const isOverdue = (r) => r.status === 'Overdue';

  return (
    <div>
      <PageHeader
        title="Reminders & follow-ups"
        subtitle={data ? `${data.length} reminders` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ Add reminder</button>}
      />

      <div className="p-8">
        <div className="mb-6">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No reminders found." action={<button onClick={openAdd} className="btn-primary">Add first reminder</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Patient','Topic','Due date','Status',''].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(r => (
                      <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${isOverdue(r) ? 'bg-red-50/30' : ''}`}>
                        <td className="table-td font-medium text-gray-900">{r.patient_name}</td>
                        <td className="table-td text-gray-500">{r.topic ?? '—'}</td>
                        <td className={`table-td text-sm ${isOverdue(r) ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{new Date(r.due_date).toLocaleString('en-GB',{dateStyle:'short'})}</td>
                        <td className="table-td"><Badge value={r.status} /></td>
                        <td className="table-td">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(r)} className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDel(r)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
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
        title={modal==='add' ? 'Add reminder' : 'Edit reminder'}>
        <ReminderForm form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal} patients={patients.data} />
      </Modal>

      <ConfirmDialog open={modal==='delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete reminder"
        message={`Delete this reminder for ${selected?.patient_name}? This cannot be undone.`}
      />
    </div>
  );
}
