import { useState } from 'react';
import { appointmentsService, patientsService, doctorsService, treatmentsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = {
  patient_id:'', doctor_id:'', treatment_id:'',
  scheduled_at:'', duration_min:'', status:'Upcoming', notes:'',
};
const STATUSES = ['Upcoming','In progress','Done','Cancelled','No-show'];

function AppointmentForm({ form, onChange, error, loading, onSubmit, onClose, patients, doctors, treatments }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Alert type="error" message={error} />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Patient *</label>
          <select name="patient_id" required value={form.patient_id} onChange={onChange} className="input">
            <option value="">— select patient —</option>
            {patients?.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Doctor *</label>
          <select name="doctor_id" required value={form.doctor_id} onChange={onChange} className="input">
            <option value="">— select doctor —</option>
            {doctors?.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Treatment</label>
          <select name="treatment_id" value={form.treatment_id} onChange={onChange} className="input">
            <option value="">— select treatment —</option>
            {treatments?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date & time *</label>
          <input name="scheduled_at" type="datetime-local" required value={form.scheduled_at} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input name="duration_min" type="number" min="5" value={form.duration_min} onChange={onChange} className="input" placeholder="45" />
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
          {loading ? 'Saving…' : 'Save appointment'}
        </button>
      </div>
    </form>
  );
}

export default function AppointmentsPage() {
  const [filters,  setFilters]  = useState({ status:'', date:'', doctor_id:'' });
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => appointmentsService.getAll({
      status:    filters.status    || undefined,
      date:      filters.date      || undefined,
      doctor_id: filters.doctor_id || undefined,
    }),
    [filters.status, filters.date, filters.doctor_id]
  );

  const patients   = useFetch(() => patientsService.getAll());
  const doctors    = useFetch(() => doctorsService.getAll());
  const treatments = useFetch(() => treatmentsService.getAll());

  const onFilterChange = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd  = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit = (a) => {
    setSelected(a);
    setForm({
      patient_id:   a.patient_id,
      doctor_id:    a.doctor_id,
      treatment_id: a.treatment_id ?? '',
      scheduled_at: a.scheduled_at?.slice(0,16) ?? '',
      duration_min: a.duration_min ?? '',
      status:       a.status,
      notes:        a.notes ?? '',
    });
    setFormErr(''); setModal('edit');
  };
  const openDel  = (a) => { setSelected(a); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      if (modal === 'add') await appointmentsService.create(form);
      else                 await appointmentsService.update(selected.id, form);
      await refetch(); closeModal();
    } catch (err) { setFormErr(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await appointmentsService.remove(selected.id); await refetch(); closeModal(); }
    catch { /* ignore */ } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={data ? `${data.length} records` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ New appointment</button>}
      />

      <div className="p-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input name="date" type="date" value={filters.date} onChange={onFilterChange} className="input w-44" />
          <select name="status" value={filters.status} onChange={onFilterChange} className="input w-40">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select name="doctor_id" value={filters.doctor_id} onChange={onFilterChange} className="input w-48">
            <option value="">All doctors</option>
            {doctors.data?.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>

        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No appointments found." action={<button onClick={openAdd} className="btn-primary">Book first appointment</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Date & time','Patient','Treatment','Doctor','Duration','Status',''].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td text-xs text-gray-500 whitespace-nowrap">
                          {new Date(a.scheduled_at).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}
                        </td>
                        <td className="table-td font-medium text-gray-900">{a.patient_name}</td>
                        <td className="table-td text-gray-500">{a.treatment_name ?? '—'}</td>
                        <td className="table-td text-gray-500">{a.doctor_name}</td>
                        <td className="table-td text-gray-500">{a.duration_min ? `${a.duration_min} min` : '—'}</td>
                        <td className="table-td"><Badge value={a.status} /></td>
                        <td className="table-td">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(a)} className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDel(a)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
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
        title={modal==='add' ? 'New appointment' : 'Edit appointment'} width="max-w-xl">
        <AppointmentForm
          form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal}
          patients={patients.data} doctors={doctors.data} treatments={treatments.data}
        />
      </Modal>

      <ConfirmDialog open={modal==='delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete appointment"
        message={`Delete this appointment for ${selected?.patient_name}? This cannot be undone.`}
      />
    </div>
  );
}
