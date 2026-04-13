import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PaymentFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [formData, setFormData] = useState({
    company_name: '',
    total_amount: '',
    pending_amount: '',
    status: 'unpaid',
    priority: 'later',
    expected_date: '',
    contact_number: '',
    remarks: '',
  });
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        expected_date: initialData.expected_date ? initialData.expected_date.split('T')[0] : '',
      });
    } else {
      setFormData({
        company_name: '',
        total_amount: '',
        pending_amount: '',
        status: 'unpaid',
        priority: 'later',
        expected_date: '',
        contact_number: '',
        remarks: '',
      });
    }
    setFile(null);
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = async () => {
    if (!formData.company_name.trim()) return "Company name is required.";
    if (Number(formData.total_amount) <= 0) return "Total amount must be greater than 0.";
    if (Number(formData.pending_amount) < 0 || Number(formData.pending_amount) > Number(formData.total_amount)) {
       return "Pending amount must be between 0 and total amount.";
    }

    // Check duplicate — use maybeSingle() so no error is thrown when 0 rows match
    const isEditingSameName =
      initialData &&
      initialData.company_name.trim().toLowerCase() === formData.company_name.trim().toLowerCase();

    if (!isEditingSameName) {
      let query = supabase
        .from('company_payments')
        .select('id')
        .ilike('company_name', formData.company_name.trim());

      // When editing, exclude the current record from the check
      if (initialData?.id) {
        query = query.neq('id', initialData.id);
      }

      const { data, error: dupError } = await query.maybeSingle();

      if (dupError) {
        console.error('Duplicate check error:', dupError);
      } else if (data) {
        return "A payment tracker for this company already exists.";
      }
    }

    return null;
  };

  const handleUpload = async () => {
    if (!file) return initialData?.bank_statement_url || null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `statements/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bank-statements')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('bank-statements').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validationError = await validateForm();
      if (validationError) throw new Error(validationError);

      const bank_statement_url = await handleUpload();

      const payload = {
        company_name: formData.company_name.trim(),
        total_amount: formData.total_amount,
        pending_amount: formData.pending_amount,
        status: formData.status,
        priority: formData.priority,
        expected_date: formData.expected_date || null,
        contact_number: formData.contact_number,
        remarks: formData.remarks,
        bank_statement_url
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('company_payments')
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_payments')
          .insert([payload]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-soft">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Payment' : 'New Payment Tracker'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="p-4 mb-6 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
          
          <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <input required name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Number</label>
                <input name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="+1 234 567 8900" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Total Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <input required type="number" step="0.01" name="total_amount" value={formData.total_amount} onChange={handleChange} className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pending Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <input required type="number" step="0.01" name="pending_amount" value={formData.pending_amount} onChange={handleChange} className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                  <option value="later">Later</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Date</label>
                <input type="date" name="expected_date" value={formData.expected_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Statement (PDF/Image)</label>
                <div className="flex items-center gap-3">
                  <input type="file" id="file-upload" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
                  <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors w-full justify-center">
                    <UploadCloud className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{file ? file.name : (initialData?.bank_statement_url ? 'Replace File' : 'Upload File')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Notes about this payment..." />
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-muted/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button form="payment-form" type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors disabled:opacity-70">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
