import { useState } from 'react';
import { treatmentHistoryService, patientsService, doctorsService, treatmentsService, appointmentsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = {
  patient_id:'', appointment_id:'', doctor_id:'',
  treatment_id:'', performed_at:'', notes:'', next_step:'',
};

function HistoryForm({ form, onChange, error, loading, onSubmit, onClose, patients, doctors, treatments, appointments }) {
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
          <label className="label">Doctor</label>
          <select name="doctor_id" value={form.doctor_id} onChange={onChange} className="input">
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
          <label className="label">Linked appointment</label>
          <select name="appointment_id" value={form.appointment_id} onChange={onChange} className="input">
            <option value="">— none —</option>
            {appointments?.map(a => (
              <option key={a.id} value={a.id}>
                #{a.id} — {a.patient_name} ({a.scheduled_at?.slice(0,10)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Performed at *</label>
          <input name="performed_at" type="date" required value={form.performed_at} onChange={onChange} className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={onChange} className="input resize-none" placeholder="What was done…" />
        </div>
        <div className="col-span-2">
          <label className="label">Next step</label>
          <input name="next_step" value={form.next_step} onChange={onChange} className="input" placeholder="Return in 6 months…" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save record'}
        </button>
      </div>
    </form>
  );
}

export default function TreatmentHistoryPage() {
  const [patientFilter, setPatientFilter] = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => treatmentHistoryService.getAll({ patient_id: patientFilter || undefined }),
    [patientFilter]
  );

  const patients     = useFetch(() => patientsService.getAll());
  const doctors      = useFetch(() => doctorsService.getAll());
  const treatments   = useFetch(() => treatmentsService.getAll());
  const appointments = useFetch(() => appointmentsService.getAll());

  const onChange   = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const openAdd    = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit   = (h) => {
    setSelected(h);
    setForm({
      patient_id:     h.patient_id,
      appointment_id: h.appointment_id ?? '',
      doctor_id:      h.doctor_id ?? '',
      treatment_id:   h.treatment_id ?? '',
      performed_at:   h.performed_at ?? '',
      notes:          h.notes ?? '',
      next_step:      h.next_step ?? '',
    });
    setFormErr(''); setModal('edit');
  };
  const openDel    = (h) => { setSelected(h); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      const payload = {
        ...form,
        appointment_id: form.appointment_id || null,
        doctor_id:      form.doctor_id      || null,
        treatment_id:   form.treatment_id   || null,
      };
      if (modal === 'add') await treatmentHistoryService.create(payload);
      else                 await treatmentHistoryService.update(selected.id, payload);
      await refetch(); closeModal();
    } catch (err) { setFormErr(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await treatmentHistoryService.remove(selected.id); await refetch(); closeModal(); }
    catch { /* ignore */ } finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Treatment history"
        subtitle={data ? `${data.length} records` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ Add record</button>}
      />

      <div className="p-8">
        <div className="mb-6">
          <select value={patientFilter} onChange={e => setPatientFilter(e.target.value)} className="input w-56">
            <option value="">All patients</option>
            {patients.data?.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No history records found." action={<button onClick={openAdd} className="btn-primary">Add first record</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Date','Patient','Treatment','Doctor','Notes','Next step',''].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(h => (
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td text-xs text-gray-500 whitespace-nowrap">{new Date(h.performed_at).toLocaleString('en-GB',{dateStyle:'short'})}</td>
                        <td className="table-td font-medium text-gray-900">{h.patient_name}</td>
                        <td className="table-td text-gray-500">{h.treatment_name ?? '—'}</td>
                        <td className="table-td text-gray-500">{h.doctor_name ?? '—'}</td>
                        <td className="table-td text-gray-500 max-w-[200px] truncate" title={h.notes}>{h.notes ?? '—'}</td>
                        <td className="table-td text-brand-600 text-xs max-w-[160px] truncate" title={h.next_step}>{h.next_step ?? '—'}</td>
                        <td className="table-td">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(h)} className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDel(h)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
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
        title={modal==='add' ? 'Add treatment record' : 'Edit treatment record'} width="max-w-xl">
        <HistoryForm
          form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal}
          patients={patients.data} doctors={doctors.data}
          treatments={treatments.data} appointments={appointments.data}
        />
      </Modal>

      <ConfirmDialog open={modal==='delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete record"
        message={`Delete this treatment history record for ${selected?.patient_name}? This cannot be undone.`}
      />
    </div>
  );
}
