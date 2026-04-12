import { useState } from 'react';
import { treatmentsService } from '../services/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { Modal, ConfirmDialog, PageSpinner, Alert, EmptyState } from '../components/ui/index.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

const EMPTY_FORM = { name:'', category:'', duration_min:'', base_price:'' };
const CATEGORIES = ['Preventive','Diagnostic','Restorative','Endodontic','Surgical','Orthodontic','Periodontic','Cosmetic','General'];

function TreatmentForm({ form, onChange, error, loading, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Alert type="error" message={error} />
      <div>
        <label className="label">Name *</label>
        <input name="name" required value={form.name} onChange={onChange} className="input" placeholder="Check-up & cleaning" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={onChange} className="input">
            <option value="">— select —</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input name="duration_min" type="number" min="5" value={form.duration_min} onChange={onChange} className="input" placeholder="45" />
        </div>
        <div className="col-span-2">
          <label className="label">Base price (฿)</label>
          <input name="base_price" type="number" min="0" step="0.01" value={form.base_price} onChange={onChange} className="input" placeholder="800.00" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save treatment'}
        </button>
      </div>
    </form>
  );
}

const CATEGORY_COLOR = {
  Preventive:'badge-green', Diagnostic:'badge-blue', Restorative:'badge-blue',
  Endodontic:'badge-amber', Surgical:'badge-red', Orthodontic:'badge-gray',
  Periodontic:'badge-amber', Cosmetic:'badge-gray', General:'badge-gray',
};

export default function TreatmentsPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => treatmentsService.getAll({ category: categoryFilter || undefined }),
    [categoryFilter]
  );

  const onChange   = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const openAdd    = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('add'); };
  const openEdit   = (t) => { setSelected(t); setForm({ ...EMPTY_FORM, ...t }); setFormErr(''); setModal('edit'); };
  const openDel    = (t) => { setSelected(t); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      if (modal === 'add') await treatmentsService.create(form);
      else                 await treatmentsService.update(selected.id, form);
      await refetch(); closeModal();
    } catch (err) { setFormErr(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await treatmentsService.remove(selected.id); await refetch(); closeModal(); }
    catch { /* ignore */ } finally { setDeleting(false); }
  };

  const fmt = (n) => n != null ? `฿${Number(n).toLocaleString()}` : '—';

  return (
    <div>
      <PageHeader
        title="Treatments"
        subtitle={data ? `${data.length} treatments` : ''}
        action={<button onClick={openAdd} className="btn-primary">+ Add treatment</button>}
      />

      <div className="p-8">
        <div className="mb-6">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input w-48">
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading && <PageSpinner />}
        {error   && <Alert message={error} />}
        {!loading && data && (
          <div className="card overflow-hidden">
            {!data.length
              ? <EmptyState message="No treatments found." action={<button onClick={openAdd} className="btn-primary">Add first treatment</button>} />
              : <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name','Category','Duration','Base price',''].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td font-medium text-gray-900">{t.name}</td>
                        <td className="table-td">
                          <span className={CATEGORY_COLOR[t.category] ?? 'badge-gray'}>{t.category ?? '—'}</span>
                        </td>
                        <td className="table-td text-gray-500">{t.duration_min ? `${t.duration_min} min` : '—'}</td>
                        <td className="table-td font-medium text-gray-800">{fmt(t.base_price)}</td>
                        <td className="table-td">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(t)} className="btn-secondary text-xs py-1 px-2">Edit</button>
                            <button onClick={() => openDel(t)}  className="btn-danger    text-xs py-1 px-2">Delete</button>
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
        title={modal==='add' ? 'Add treatment' : 'Edit treatment'}>
        <TreatmentForm form={form} onChange={onChange} error={formErr} loading={saving}
          onSubmit={handleSave} onClose={closeModal} />
      </Modal>

      <ConfirmDialog open={modal==='delete'} onClose={closeModal} onConfirm={handleDelete} loading={deleting}
        title="Delete treatment"
        message={`Delete "${selected?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
