import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PaymentFormModal } from '../components/payments/PaymentFormModal';
import { 
  Search, Plus, Filter, AlertCircle, FileText, Anchor, 
  Trash2, Edit, CreditCard, Clock, TrendingDown, ArrowUpRight, SearchX, ExternalLink, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInDays, isPast, isToday, parseISO, startOfMonth } from 'date-fns';

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, unpaid, today, paid
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_payments')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false }) // 'immediate' often sorts textually, but let's sort below
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const { error } = await supabase.from('company_payments').update({ is_active: false }).eq('id', id);
      if(error) throw error;
      fetchPayments();
    } catch(err) {
      console.error(err);
    }
  };

  const openEdit = (payment) => {
    setEditData(payment);
    setModalOpen(true);
  };
  
  const openNew = () => {
    setEditData(null);
    setModalOpen(true);
  };

  // Derived Stats
  const stats = useMemo(() => {
    const totalOutstanding = payments.filter(p => p.status === 'unpaid').reduce((acc, p) => acc + Number(p.pending_amount), 0);
    const immediateCount = payments.filter(p => p.status === 'unpaid' && p.priority === 'immediate').length;
    
    const startOfCurrentMonth = startOfMonth(new Date());
    const totalPaidMonth = payments
      .filter(p => p.status === 'paid' && new Date(p.created_at) >= startOfCurrentMonth) // Simple approx for paid this month
      .reduce((acc, p) => acc + Number(p.total_amount), 0);
      
    // Overdue or due soon (<= 2 days)
    const overdueOrSoon = payments.filter(p => {
      if(p.status === 'paid' || !p.expected_date) return false;
      const days = differenceInDays(parseISO(p.expected_date), new Date());
      return days <= 2;
    });

    return { totalOutstanding, immediateCount, totalPaidMonth, overdueOrSoon };
  }, [payments]);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    return payments.filter(p => {
      // Search logic
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        p.company_name.toLowerCase().includes(searchLower) ||
        (p.contact_number && p.contact_number.toLowerCase().includes(searchLower)) ||
        (p.remarks && p.remarks.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Filter logic
      if (filterMode === 'unpaid') return p.status === 'unpaid';
      if (filterMode === 'paid') return p.status === 'paid';
      if (filterMode === 'today') {
        if(!p.expected_date || p.status === 'paid') return false;
        return isToday(parseISO(p.expected_date));
      }
      return true;
    }).sort((a, b) => {
      // Sort by priority first (immediate > later)
      if (a.priority === 'immediate' && b.priority !== 'immediate') return -1;
      if (b.priority === 'immediate' && a.priority !== 'immediate') return 1;
      return 0; // fallback to created_at from db
    });
  }, [payments, search, filterMode]);


  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div>
         <h2 className="text-2xl font-bold tracking-tight text-foreground">Company Payments</h2>
         <p className="text-muted-foreground mt-1">Manage, track, and record outstanding balances.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-24 h-24" />
            </div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Outstanding</h3>
            <div className="text-3xl font-bold mt-2 text-red-600">{formatCurrency(stats.totalOutstanding)}</div>
         </div>
         <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="w-24 h-24" />
            </div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Immediate Priorities</h3>
            <div className="text-3xl font-bold mt-2 text-amber-500">{stats.immediateCount}</div>
         </div>
         <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowUpRight className="w-24 h-24" />
            </div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Paid (This Month)</h3>
            <div className="text-3xl font-bold mt-2 text-emerald-600">{formatCurrency(stats.totalPaidMonth)}</div>
         </div>
      </div>

      {stats.overdueOrSoon.length > 0 && (
         <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
               <h4 className="font-semibold text-red-800">Attention Required</h4>
               <p className="text-sm mt-1 text-red-700">You have {stats.overdueOrSoon.length} payment(s) that are either overdue or expected within the next 48 hours.</p>
            </div>
         </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border">
         <div className="flex items-center w-full sm:w-auto relative group">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies, remarks..." 
              className="pl-9 pr-4 py-2 w-full sm:w-80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <div className="flex bg-muted p-1 rounded-lg border">
               {['all', 'unpaid', 'today', 'paid'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilterMode(f)}
                   className={cn(
                     "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize whitespace-nowrap",
                     filterMode === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                   )}
                 >
                   {f}
                 </button>
               ))}
            </div>
            <button onClick={openNew} className="bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-sm">
               <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Payment</span>
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
           <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase tracking-wider">
                 <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Amounts</th>
                    <th className="px-6 py-4">Status & Priority</th>
                    <th className="px-6 py-4">Expected Date</th>
                    <th className="px-6 py-4">Docs & Remarks</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <Loader2 className="w-6 h-6 animate-spin text-primary" />
                           <span>Loading payments...</span>
                        </div>
                      </td>
                    </tr>
                 ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                           <SearchX className="w-8 h-8 text-muted-foreground/50" />
                           <p>No payments found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                 ) : (
                    filteredData.map(payment => {
                       const isPaid = payment.status === 'paid';
                       const isImmediate = payment.priority === 'immediate';
                       const expectedDateIso = payment.expected_date ? parseISO(payment.expected_date) : null;
                       const overdue = !isPaid && expectedDateIso && isPast(expectedDateIso) && !isToday(expectedDateIso);
                       
                       return (
                         <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                               <div className="font-semibold text-foreground">{payment.company_name}</div>
                               <div className="text-xs text-muted-foreground mt-0.5">{payment.contact_number || 'No contact'}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="font-medium text-foreground">{formatCurrency(payment.total_amount)}</div>
                               <div className="text-xs text-red-600 font-medium">Pending: {formatCurrency(payment.pending_amount)}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col gap-2 items-start">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                                    isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {payment.status}
                                  </span>
                                  {!isPaid && (
                                     <span className={cn(
                                       "px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1",
                                       isImmediate ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                     )}>
                                        {isImmediate && <AlertCircle className="w-3 h-3" />}
                                        {payment.priority}
                                     </span>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               {expectedDateIso ? (
                                  <div className={cn("text-sm font-medium flex items-center gap-1.5", overdue ? "text-red-600" : "")}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {format(expectedDateIso, 'MMM d, yyyy')}
                                    {overdue && <span className="text-[10px] uppercase font-bold tracking-wider ml-1 px-1 bg-red-100 rounded">Overdue</span>}
                                  </div>
                               ) : <span className="text-muted-foreground text-sm">-</span>}
                               {!isPaid && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                     Pending for {differenceInDays(new Date(), parseISO(payment.created_at))} days
                                  </div>
                               )}
                            </td>
                            <td className="px-6 py-4">
                               {payment.bank_statement_url && (
                                  <a href={payment.bank_statement_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mb-1.5 bg-primary/5 px-2 py-1 rounded">
                                    <FileText className="w-3.5 h-3.5" /> View Statement <ExternalLink className="w-3 h-3" />
                                  </a>
                               )}
                               {payment.remarks && (
                                 <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={payment.remarks}>
                                    {payment.remarks}
                                 </p>
                               )}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openEdit(payment)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                     <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(payment.id)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       )
                    })
                 )}
              </tbody>
           </table>
        </div>
      </div>

      <PaymentFormModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchPayments} 
        initialData={editData} 
      />

    </div>
  )
}
