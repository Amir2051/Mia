'use client';
import { useState, useCallback } from 'react';
import { Search, X, Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Circle, ExternalLink, FolderOpen } from 'lucide-react';

// Use empty string so requests go through Next.js proxy (/api/* → backend)
const API = '';

const FRAUD_TYPES = [
  'Cryptocurrency Fraud',
  'Pig Butchering / Romance Scam',
  'Investment Fraud',
  'Rug Pull / DeFi Scam',
  'NFT Fraud',
  'Phishing / Wallet Drainer',
  'Ponzi / Pyramid Scheme',
  'Business Email Compromise',
  'Money Laundering',
  'Other',
];

function SysTag({ children, color = 'matrix' }) {
  const colors = {
    matrix: { bg: 'rgba(0,255,65,.08)',  border: 'rgba(0,255,65,.25)',  text: '#00ff41' },
    amber:  { bg: 'rgba(255,149,0,.08)', border: 'rgba(255,149,0,.25)', text: '#ff9500' },
    danger: { bg: 'rgba(255,45,45,.08)', border: 'rgba(255,45,45,.25)', text: '#ff2d2d' },
    cyan:   { bg: 'rgba(0,229,255,.08)', border: 'rgba(0,229,255,.25)', text: '#00e5ff' },
  };
  const c = colors[color] || colors.matrix;
  return (
    <span className="text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {children}
    </span>
  );
}

function TxRow({ tx, chain }) {
  const [open, setOpen] = useState(false);
  const dir = tx.direction || '';
  const isOut = dir.includes('VICTIM→');
  return (
    <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,255,65,.08)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/[.02] transition-colors">
        <span className="text-[9px] font-mono" style={{ color: isOut ? '#ff2d2d' : '#00ff41', minWidth: 120 }}>
          {dir || 'LINKED'}
        </span>
        <span className="text-xs font-mono flex-1" style={{ color: '#c8e6c8' }}>
          {tx.amountEth ? `${tx.amountEth} ETH` : tx.amount || '—'}
        </span>
        <span className="text-[9px] font-mono opacity-50">{tx.date ? tx.date.split('T')[0] : ''}</span>
        {open ? <ChevronUp size={10} style={{ color: '#00ff41' }} /> : <ChevronDown size={10} style={{ color: '#00ff41', opacity: .5 }} />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 font-mono text-[10px] space-y-1" style={{ background: 'rgba(0,255,65,.02)', color: 'rgba(200,230,200,.6)' }}>
          <p><span className="opacity-50">HASH  </span>
            <a href={tx.explorerUrl} target="_blank" rel="noreferrer" className="underline hover:opacity-80 break-all" style={{ color: '#00e5ff' }}>
              {tx.hash}
            </a>
          </p>
          {tx.status && <p><span className="opacity-50">STATUS</span> {tx.status}</p>}
          {tx.gasUsed && <p><span className="opacity-50">GAS   </span> {tx.gasUsed}</p>}
        </div>
      )}
    </div>
  );
}

export default function InvestigatePanel({ onClose }) {
  const [form, setForm] = useState({ victimAddress: '', suspectAddress: '', chain: 'auto', fraudType: 'Cryptocurrency Fraud', notes: '' });
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const [savedCases, setSavedCases] = useState(null);
  const [showCases,  setShowCases]  = useState(false);

  const run = useCallback(async () => {
    if (!form.victimAddress.trim() || !form.suspectAddress.trim()) {
      setError('Both wallet addresses are required.'); return;
    }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Investigation failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const loadCases = useCallback(async () => {
    const res  = await fetch(`${API}/api/investigate/cases`);
    const data = await res.json();
    setSavedCases(Array.isArray(data) ? data : []);
    setShowCases(true);
  }, []);

  const inv  = result?.profile?.investigation;
  const ic3  = result?.profile?.ic3Submission;
  const flow = inv?.moneyFlow || {};

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-3xl rounded-sm font-mono" style={{ background: '#020802', border: '1px solid rgba(0,255,65,.2)', boxShadow: '0 0 60px rgba(0,255,65,.1)' }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(0,255,65,.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px #ff9500', animation: 'eyePulse 1.5s ease-in-out infinite' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: '#ff9500' }}>Wallet Investigation Module</span>
            <SysTag color="amber">Blockchain Intelligence</SysTag>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadCases} className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] transition-colors"
              style={{ border: '1px solid rgba(0,255,65,.2)', color: 'rgba(0,255,65,.6)' }}>
              <FolderOpen size={11} /> Saved Cases
            </button>
            <button onClick={onClose} style={{ color: 'rgba(0,255,65,.4)' }} className="hover:opacity-80">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* ── Saved Cases List ───────────────────────────────── */}
          {showCases && savedCases && (
            <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,255,65,.1)' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ background: 'rgba(0,255,65,.04)', borderBottom: '1px solid rgba(0,255,65,.08)' }}>
                <span className="text-[10px] tracking-widest" style={{ color: '#00ff41' }}>SAVED CASE PROFILES ({savedCases.length})</span>
                <button onClick={() => setShowCases(false)} style={{ color: 'rgba(0,255,65,.4)' }}><X size={11} /></button>
              </div>
              {savedCases.length === 0 ? (
                <p className="px-4 py-3 text-[10px] opacity-40" style={{ color: '#c8e6c8' }}>No cases saved yet.</p>
              ) : savedCases.map(c => (
                <div key={c.caseId} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,255,65,.05)' }}>
                  <SysTag color={c.netLoss > 0 ? 'danger' : 'matrix'}>{c.chain}</SysTag>
                  <span className="text-[10px]" style={{ color: '#ff9500', minWidth: 120 }}>{c.caseId}</span>
                  <span className="text-[10px] flex-1 truncate opacity-60" style={{ color: '#c8e6c8' }}>{c.victimAddress?.slice(0, 12)}…</span>
                  <span className="text-[10px]" style={{ color: '#ff2d2d' }}>{c.netLoss?.toFixed(4)} {c.chain}</span>
                  <span className="text-[9px] opacity-40" style={{ color: '#c8e6c8' }}>{c.generatedAt?.split('T')[0]}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Input Form ────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'victimAddress', label: 'VICTIM WALLET', placeholder: '0x... or Bitcoin address', color: '#ff9500' },
                { key: 'suspectAddress', label: 'SUSPECT WALLET', placeholder: '0x... or Bitcoin address', color: '#ff2d2d' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] tracking-widest uppercase block mb-1.5" style={{ color: f.color }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-[11px] px-3 py-2 rounded-sm outline-none"
                    style={{ background: 'rgba(0,0,0,.5)', border: `1px solid ${f.color}20`, color: '#c8e6c8', caretColor: f.color }}
                    onFocus={e  => e.target.style.borderColor = f.color + '50'}
                    onBlur={e   => e.target.style.borderColor = f.color + '20'}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] tracking-widest uppercase block mb-1.5 opacity-50" style={{ color: '#c8e6c8' }}>FRAUD TYPE</label>
                <select value={form.fraudType} onChange={e => setForm(p => ({ ...p, fraudType: e.target.value }))}
                  className="w-full text-[11px] px-3 py-2 rounded-sm outline-none"
                  style={{ background: '#040804', border: '1px solid rgba(0,255,65,.15)', color: '#c8e6c8' }}>
                  {FRAUD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] tracking-widest uppercase block mb-1.5 opacity-50" style={{ color: '#c8e6c8' }}>CHAIN</label>
                <select value={form.chain} onChange={e => setForm(p => ({ ...p, chain: e.target.value }))}
                  className="w-full text-[11px] px-3 py-2 rounded-sm outline-none"
                  style={{ background: '#040804', border: '1px solid rgba(0,255,65,.15)', color: '#c8e6c8' }}>
                  <option value="auto">Auto-detect</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] tracking-widest uppercase block mb-1.5 opacity-50" style={{ color: '#c8e6c8' }}>INVESTIGATOR NOTES (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="How the fraud occurred, victim's account of events, communication platform used..."
                rows={3}
                className="w-full text-[11px] px-3 py-2 rounded-sm outline-none resize-none"
                style={{ background: 'rgba(0,0,0,.5)', border: '1px solid rgba(0,255,65,.1)', color: '#c8e6c8' }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm text-[11px]" style={{ background: 'rgba(255,45,45,.06)', border: '1px solid rgba(255,45,45,.2)', color: '#ff2d2d' }}>
              <AlertTriangle size={12} /> {error}
            </div>
          )}

          <button onClick={run} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-xs tracking-widest uppercase transition-all disabled:opacity-40"
            style={{ background: loading ? 'rgba(255,149,0,.05)' : 'rgba(255,149,0,.1)', border: '1px solid rgba(255,149,0,.3)', color: '#ff9500', boxShadow: loading ? 'none' : '0 0 20px rgba(255,149,0,.1)' }}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent" style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing blockchain...
              </>
            ) : (
              <><Search size={13} /> Run Investigation</>
            )}
          </button>

          {/* ── Results ──────────────────────────────────────── */}
          {result && inv && ic3 && (
            <div className="space-y-4">

              {/* Summary bar */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-sm flex-wrap" style={{ background: 'rgba(0,255,65,.04)', border: '1px solid rgba(0,255,65,.15)' }}>
                <SysTag color="amber">{result.caseId}</SysTag>
                <SysTag color={inv.chain === 'ETH' ? 'cyan' : 'amber'}>{inv.chain}</SysTag>
                <span className="text-[10px]" style={{ color: '#c8e6c8' }}>
                  <span className="opacity-50">Linked tx: </span>
                  <span style={{ color: '#00ff41' }}>{inv.linkedTransactions?.length || 0}</span>
                </span>
                <span className="text-[10px]" style={{ color: '#c8e6c8' }}>
                  <span className="opacity-50">Net loss: </span>
                  <span style={{ color: '#ff2d2d' }}>{(flow.netLoss || 0).toFixed(6)} {inv.chain}</span>
                </span>
                <span className="text-[10px]" style={{ color: '#c8e6c8' }}>
                  <span className="opacity-50">Suspect balance: </span>
                  <span style={{ color: '#ff9500' }}>{(inv.suspectCurrentBalance || inv.suspectBalance || 0).toFixed(4)} {inv.chain}</span>
                </span>
                <span className="ml-auto text-[9px] opacity-40" style={{ color: '#c8e6c8' }}>
                  Saved → {result.savedFiles?.report?.split('/').slice(-2).join('/')}
                </span>
              </div>

              {/* Timeline */}
              {inv.timeline?.firstContact && (
                <div className="px-4 py-3 rounded-sm" style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(0,255,65,.08)' }}>
                  <p className="text-[9px] tracking-widest uppercase mb-2 opacity-50" style={{ color: '#c8e6c8' }}>Timeline</p>
                  <div className="flex gap-6 text-[10px]">
                    <span><span className="opacity-50">First: </span><span style={{ color: '#ff9500' }}>{inv.timeline.firstContact?.split('T')[0]}</span></span>
                    <span><span className="opacity-50">Last: </span><span style={{ color: '#ff9500' }}>{inv.timeline.lastContact?.split('T')[0]}</span></span>
                    <span><span className="opacity-50">Duration: </span><span style={{ color: '#00ff41' }}>{inv.timeline.durationDays} days</span></span>
                  </div>
                </div>
              )}

              {/* Transactions */}
              {(inv.linkedTransactions?.length || 0) > 0 && (
                <div>
                  <p className="text-[9px] tracking-widest uppercase mb-2 opacity-50" style={{ color: '#c8e6c8' }}>
                    Transaction Evidence ({inv.linkedTransactions.length})
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {inv.linkedTransactions.map((tx, i) => (
                      <TxRow key={i} tx={tx} chain={inv.chain} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suspect outgoing (follow the money) */}
              {(inv.suspectOutgoingAddresses?.length || 0) > 0 && (
                <div>
                  <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: '#ff2d2d', opacity: .8 }}>
                    Follow The Money — Suspect Outgoing Addresses
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {inv.suspectOutgoingAddresses.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-sm text-[10px]" style={{ background: 'rgba(255,45,45,.03)', border: '1px solid rgba(255,45,45,.08)' }}>
                        <span className="opacity-40 text-[9px]">{String(i+1).padStart(2,'0')}</span>
                        <span className="flex-1 truncate" style={{ color: '#ff2d2d' }}>{a.address || a}</span>
                        <span style={{ color: '#ff9500' }}>{(a.totalEth || 0).toFixed(4)} ETH</span>
                        <a href={`https://etherscan.io/address/${a.address || a}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-80">
                          <ExternalLink size={10} style={{ color: '#00e5ff' }} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IC3 checklist */}
              <div>
                <p className="text-[9px] tracking-widest uppercase mb-2 opacity-50" style={{ color: '#c8e6c8' }}>IC3 Submission Checklist</p>
                <div className="grid grid-cols-2 gap-1">
                  {ic3.submissionChecklist?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      {item.done
                        ? <CheckCircle size={11} style={{ color: '#00ff41', flexShrink: 0 }} />
                        : <Circle     size={11} style={{ color: 'rgba(200,230,200,.3)', flexShrink: 0 }} />}
                      <span style={{ color: item.done ? '#c8e6c8' : 'rgba(200,230,200,.4)' }}>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <a href="https://www.ic3.gov" target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] tracking-widest uppercase rounded-sm transition-all"
                  style={{ background: 'rgba(255,45,45,.06)', border: '1px solid rgba(255,45,45,.2)', color: '#ff2d2d' }}>
                  <ExternalLink size={11} /> Submit to IC3.gov
                </a>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(result.profile, null, 2)], { type: 'application/json' });
                    const url  = URL.createObjectURL(blob);
                    const a    = document.createElement('a');
                    a.href = url; a.download = `${result.caseId}.json`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] tracking-widest uppercase rounded-sm transition-all"
                  style={{ background: 'rgba(0,255,65,.05)', border: '1px solid rgba(0,255,65,.2)', color: '#00ff41' }}>
                  <Download size={11} /> Export JSON
                </button>
              </div>

              <p className="text-[9px] text-center opacity-30" style={{ color: '#c8e6c8' }}>
                Full IC3 report + JSON saved to: {result.savedFiles?.report?.split('/').pop()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
