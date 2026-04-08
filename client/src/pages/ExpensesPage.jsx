import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Plus, Search, Trash2, Loader2, Mic, MicOff, AlertCircle } from 'lucide-react'
import { getExpenses, addExpense, deleteExpense } from '../api/expense.api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Rent', 'Education', 'Utilities', 'Medical', 
  'Investment', 'Savings', 'Debt', 
  'Food', 'Transport', 'Shopping', 'Travel', 'Entertainment', 'Other'
]

const CATEGORY_MAP = {
  'Rent': 'FIXED', 'Education': 'FIXED', 'Utilities': 'FIXED', 'Medical': 'FIXED',
  'Investment': 'WEALTH', 'Savings': 'WEALTH', 'Debt': 'WEALTH',
  'Food': 'VARIABLE', 'Transport': 'VARIABLE', 'Shopping': 'VARIABLE', 
  'Travel': 'VARIABLE', 'Entertainment': 'VARIABLE', 'Other': 'VARIABLE'
};

const EMPTY_FORM = { title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] }

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => { fetchExpenses() }, [])

  const fetchExpenses = async () => {
    try {
      const { data } = await getExpenses()
      setExpenses(data.expenses || [])
    } catch (err) { toast.error('Fetch Error') }
    finally { setLoading(false) }
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Browser unsupported");
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      const amount = text.match(/\d+/)?.[0] || '';
      let cat = 'Other';
      if (text.includes('rent')) cat = 'Rent';
      if (text.includes('health') || text.includes('doctor') || text.includes('medical') || text.includes('medicine')) cat = 'Medical';
      if (text.includes('food') || text.includes('dinner')) cat = 'Food';
      if (text.includes('school') || text.includes('college')) cat = 'Education';
      
      setForm({ ...EMPTY_FORM, title: text, amount, category: cat });
      setShowModal(true);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { 
      ...form, 
      amount: Number(form.amount),
      nature: CATEGORY_MAP[form.category] || 'VARIABLE' 
    };

    try {
      await addExpense(payload);
      toast.success('Entry Committed');
      setShowModal(false);
      fetchExpenses();
      setForm(EMPTY_FORM);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Check Category Names';
      toast.error(errorMsg);
    } finally { setSubmitting(false) }
  }

  return (
    <PageWrapper title="Ledger">
      <div className="flex gap-4 mb-8">
        <button onClick={startVoice} className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/20' : 'bg-gray-800'}`}>
          {isListening ? <MicOff className="text-white" size={20}/> : <Mic className="text-gray-400" size={20}/>}
        </button>
        <button onClick={() => setShowModal(true)} className="btn-primary flex-1 py-4 text-sm font-bold uppercase tracking-widest">Manual Entry</button>
      </div>

      <div className="space-y-3">
        {loading ? <Loader2 className="animate-spin mx-auto text-indigo-500 mt-10" /> : 
         expenses.map((exp) => (
          <div key={exp._id} className="card flex items-center justify-between py-4 border-gray-900 bg-gray-900/20">
            <div className="flex items-center gap-4">
              <div className={`w-1 h-10 rounded-full ${exp.nature === 'FIXED' ? 'bg-rose-500' : exp.nature === 'WEALTH' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <div>
                <p className="font-bold text-white">{exp.title}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{exp.category} • {exp.nature}</p>
              </div>
            </div>
            <div className="text-right">
                <p className="font-mono font-bold text-white text-lg">₹{exp.amount.toLocaleString()}</p>
                <button onClick={() => deleteExpense(exp._id).then(fetchExpenses)} className="text-gray-700 hover:text-rose-500 transition-colors text-[10px] uppercase font-bold">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="card w-full max-w-md border-indigo-500/30">
            <h2 className="text-xl font-bold text-white mb-6">Log Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input className="input-field bg-gray-900" placeholder="Transaction Description" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="input-field bg-gray-900" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required/>
                <select className="input-field bg-gray-900" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button disabled={submitting} className="btn-primary w-full py-4 font-bold uppercase tracking-widest">
                {submitting ? 'Syncing...' : 'Commit to Database'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-gray-500 text-[10px] uppercase font-bold tracking-widest pt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}