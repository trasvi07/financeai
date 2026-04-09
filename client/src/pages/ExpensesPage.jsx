import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Plus, Search, Trash2, Loader2, Mic, MicOff } from 'lucide-react'
import { getExpenses, addExpense, deleteExpense } from '../api/expense.api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Rent', 'Medical', 'Education', 'Utilities', 
  'Investment', 'Savings', 'Debt', 
  'Food', 'Transport', 'Shopping', 'Travel', 'Entertainment', 'Other'
]

const CATEGORY_MAP = {
  'Rent': 'FIXED', 'Medical': 'FIXED', 'Education': 'FIXED', 'Utilities': 'FIXED',
  'Investment': 'SAVINGS', 'Savings': 'SAVINGS', 'Debt': 'SAVINGS',
  'Food': 'DAILY', 'Transport': 'DAILY', 'Shopping': 'DAILY', 
  'Travel': 'DAILY', 'Entertainment': 'DAILY', 'Other': 'DAILY'
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] })
  const [submitting, setSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const fetchExpenses = async () => {
    try {
      const { data } = await getExpenses()
      setExpenses(data.expenses || [])
    } catch (err) { toast.error('Sync Error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExpenses() }, [])

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Mic not supported");
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      const amount = text.match(/\d+/)?.[0] || '';
      let cat = 'Other';
      if (text.includes('rent')) cat = 'Rent';
      if (text.includes('doctor') || text.includes('medical') || text.includes('health')) cat = 'Medical';
      if (text.includes('food')) cat = 'Food';
      setForm({ ...form, title: text, amount, category: cat });
      setShowModal(true);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, amount: Number(form.amount), nature: CATEGORY_MAP[form.category] };
    try {
      await addExpense(payload);
      toast.success('Added!');
      setShowModal(false);
      fetchExpenses();
      setForm({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSubmitting(false) }
  }

  return (
    <PageWrapper title="My Expenses">
      <div className="flex gap-4 mb-6">
        <button onClick={startVoice} className={`p-4 rounded-xl ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-800'}`}>
          <Mic className="text-white" size={20}/>
        </button>
        <button onClick={() => setShowModal(true)} className="btn-primary flex-1 font-bold">ADD NEW ENTRY</button>
      </div>
      <div className="space-y-3">
        {loading ? <Loader2 className="animate-spin mx-auto mt-10" /> : expenses.map((exp) => (
          <div key={exp._id} className="card flex items-center justify-between py-3 border-gray-900">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-8 rounded-full ${exp.nature === 'FIXED' ? 'bg-green-500' : exp.nature === 'SAVINGS' ? 'bg-indigo-500' : 'bg-blue-500'}`} />
              <div>
                <p className="font-bold text-white text-sm">{exp.title}</p>
                <p className="text-[10px] text-gray-500 uppercase">{exp.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-bold text-white text-sm">₹{exp.amount.toLocaleString()}</p>
              <button onClick={() => deleteExpense(exp._id).then(fetchExpenses)} className="text-gray-700 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input-field" placeholder="What for?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="input-field" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required/>
                <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button disabled={submitting} className="btn-primary w-full py-3">{submitting ? 'Saving...' : 'SAVE ENTRY'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-xs text-gray-500 mt-2">CANCEL</button>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}