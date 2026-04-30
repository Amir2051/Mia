import { writeFile, mkdir, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { chat } from './aiService.js';

const __dirname  = fileURLToPath(new URL('.', import.meta.url));
export const CASES_DIR = join(__dirname, '../../../cases');

async function ensureCasesDir() {
  await mkdir(CASES_DIR, { recursive: true });
}

function caseId() {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MIA-${y}-${r}`;
}

// ── AI-generated IC3 narrative ───────────────────────────────────────────────
async function generateNarrative({ inv, notes, fraudType }) {
  const flow = inv.moneyFlow || {};
  const prompt = `You are writing a formal IC3 (Internet Crime Complaint Center) case narrative for law enforcement submission.

INVESTIGATION DATA:
- Fraud type: ${fraudType}
- Blockchain: ${inv.chain}
- Victim wallet: ${inv.victimAddress}
- Suspect wallet: ${inv.suspectAddress}
- Total lost: ${flow.netLoss?.toFixed(6) || 'unknown'} ${inv.chain}
- Linked transactions: ${inv.linkedTransactions?.length || 0}
- First contact: ${inv.timeline?.firstContact || 'unknown'}
- Last contact: ${inv.timeline?.lastContact || 'unknown'}
- Suspect current balance: ${inv.suspectCurrentBalance || inv.suspectBalance || 'unknown'} ${inv.chain}
- Investigator notes: ${notes || 'None provided'}

Write a professional 4–5 paragraph IC3 narrative covering:
1. Brief summary of the fraud incident
2. How the victim was targeted and the nature of the scheme
3. Detailed transaction timeline and financial flow on the blockchain
4. On-chain evidence summary (addresses, hashes, amounts)
5. Requested law enforcement action (wallet freeze, subpoena, prosecution)

Use formal law enforcement language. Be factual. Do not speculate beyond the data.`;

  try {
    const result = await chat({ messages: [{ role: 'user', content: prompt }], stream: false });
    return result.content;
  } catch {
    return '[AI narrative unavailable — write manually based on investigation data above]';
  }
}

// ── Generate + save case profile ─────────────────────────────────────────────
export async function generateCaseProfile({ investigationData: inv, userNotes = '', fraudType = 'Cryptocurrency Fraud' }) {
  const id  = caseId();
  const now = new Date().toISOString();

  const narrative = await generateNarrative({ inv, notes: userNotes, fraudType });

  const flow = inv.moneyFlow || {};
  const profile = {
    caseId:      id,
    generatedAt: now,
    status:      'DRAFT',
    fraudType,
    investigation: inv,
    ic3Submission: {
      caseId:      id,
      dateReported: now.split('T')[0],
      fraudType,
      financialLoss: {
        amount:      flow.netLoss || flow.totalEthLost || flow.totalBtcLost || 0,
        currency:    inv.chain,
        usdEstimate: null,
      },
      victim: {
        walletAddress: inv.victimAddress,
        chain:         inv.chain,
        totalTxOnChain: inv.victimTxCount,
        linkedTxToSuspect: inv.linkedTransactions?.length || 0,
      },
      suspect: {
        walletAddress:  inv.suspectAddress,
        currentBalance: inv.suspectCurrentBalance || inv.suspectBalance || 0,
        outgoingAddresses: (inv.suspectOutgoingAddresses || []).slice(0, 10),
      },
      timeline: inv.timeline,
      linkedTransactions: inv.linkedTransactions || [],
      linkedTokenTransfers: inv.linkedTokenTransfers || [],
      narrative,
      submissionChecklist: [
        { item: 'Victim wallet address documented',     done: !!inv.victimAddress },
        { item: 'Suspect wallet address documented',    done: !!inv.suspectAddress },
        { item: 'Transaction hashes collected',         done: (inv.linkedTransactions?.length || 0) > 0 },
        { item: 'Financial loss calculated in crypto',  done: (flow.netLoss || 0) > 0 },
        { item: 'USD loss amount estimated',            done: false },
        { item: 'Fraud timeline documented',            done: !!inv.timeline?.firstContact },
        { item: 'Suspect outgoing addresses traced',    done: (inv.suspectOutgoingAddresses?.length || 0) > 0 },
        { item: 'Communication records attached',       done: false },
        { item: 'IC3 complaint submitted at ic3.gov',   done: false },
      ],
    },
    userNotes,
  };

  await ensureCasesDir();

  const jsonPath   = join(CASES_DIR, `${id}.json`);
  const reportPath = join(CASES_DIR, `${id}-IC3-Report.txt`);

  await Promise.all([
    writeFile(jsonPath,   JSON.stringify(profile, null, 2)),
    writeFile(reportPath, buildTextReport(profile)),
  ]);

  return { profile, jsonPath, reportPath, caseId: id };
}

// ── Human-readable IC3 report ─────────────────────────────────────────────────
function buildTextReport(profile) {
  const s = profile.ic3Submission;
  const flow = profile.investigation.moneyFlow || {};
  const linked = s.linkedTransactions || [];

  return `
╔══════════════════════════════════════════════════════════════════════╗
║              MIA INTELLIGENCE NETWORK — SafeNestT                   ║
║               IC3 CASE REPORT   [ ${profile.caseId} ]              ║
╚══════════════════════════════════════════════════════════════════════╝

Generated   : ${profile.generatedAt}
Status      : ${profile.status}
Fraud Type  : ${profile.fraudType}
Blockchain  : ${profile.investigation.chain}

━━━ VICTIM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Wallet Address  : ${s.victim.walletAddress}
Total On-Chain Tx: ${s.victim.totalTxOnChain}
Linked to Suspect: ${s.victim.linkedTxToSuspect} transactions

━━━ SUSPECT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Wallet Address  : ${s.suspect.walletAddress}
Current Balance : ${s.suspect.currentBalance} ${profile.investigation.chain}
Known Outgoing Addresses (follow the money):
${(s.suspect.outgoingAddresses || []).map(a =>
  `  → ${a.address || a}  (${(a.totalEth || 0).toFixed(4)} ETH  ·  ${a.txCount || '?'} txns)`
).join('\n') || '  None identified'}

━━━ FINANCIAL LOSS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent by Victim  : ${(flow.totalEthLost || flow.totalBtcLost || 0).toFixed(6)} ${profile.investigation.chain}
Returned        : ${(flow.totalEthReturned || 0).toFixed(6)} ${profile.investigation.chain}
Net Loss        : ${(flow.netLoss || 0).toFixed(6)} ${profile.investigation.chain}
USD Estimate    : [FILL IN — see https://coinmarketcap.com for historic rates]

━━━ TIMELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First Contact   : ${s.timeline?.firstContact || 'Unknown'}
Last Contact    : ${s.timeline?.lastContact  || 'Unknown'}
Duration        : ${s.timeline?.durationDays || '?'} days

━━━ TRANSACTION EVIDENCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${linked.length === 0 ? '  No direct linked transactions found' :
linked.map(tx =>
`  [${tx.date || 'unknown'}]  ${tx.direction || ''}
  Amount      : ${tx.amountEth ? tx.amountEth + ' ETH' : tx.amount || 'unknown'}
  Hash        : ${tx.hash}
  Explorer    : ${tx.explorerUrl || 'N/A'}
  Status      : ${tx.status || 'unknown'}
  ─────────────────────────────────────────────────────────────────`
).join('\n')}

━━━ TOKEN TRANSFERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${(s.linkedTokenTransfers || []).length === 0 ? '  None detected' :
(s.linkedTokenTransfers || []).map(tx =>
`  [${tx.date}]  ${tx.direction}  ${tx.amount} ${tx.tokenSymbol}
  Hash: ${tx.hash}  |  Explorer: ${tx.explorerUrl}`
).join('\n')}

━━━ IC3 NARRATIVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${s.narrative}

━━━ SUBMISSION CHECKLIST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${s.submissionChecklist.map(i => `  [${i.done ? '✓' : '○'}]  ${i.item}`).join('\n')}

━━━ HOW TO FILE WITH IC3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to: https://www.ic3.gov/
2. Click "File a Complaint"
3. Complete all required fields using the data above
4. Attach screenshots of transaction hashes as evidence
5. Reference your Case ID: ${profile.caseId}

Required information for IC3:
  • Your full name and contact details
  • Date of incident and total USD loss
  • Description of how the fraud occurred
  • Suspect names/aliases/usernames used
  • Transaction hashes as blockchain evidence
  • Any chat logs, emails, or screenshots

━━━ INVESTIGATOR NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${profile.userNotes || '[No additional notes provided]'}

╔══════════════════════════════════════════════════════════════════════╗
║  Built by Ronzoro · SafeNestT Intelligence Network · Mia v2.0       ║
║  This report is for law enforcement submission purposes only.        ║
╚══════════════════════════════════════════════════════════════════════╝
`.trim();
}

// ── Case listing helpers ──────────────────────────────────────────────────────
export async function listCases() {
  await ensureCasesDir();
  const files = await readdir(CASES_DIR).catch(() => []);
  const summaries = await Promise.all(
    files.filter(f => f.endsWith('.json')).map(async f => {
      try {
        const raw = await readFile(join(CASES_DIR, f), 'utf-8');
        const d   = JSON.parse(raw);
        return {
          caseId:        d.caseId,
          generatedAt:   d.generatedAt,
          fraudType:     d.fraudType,
          status:        d.status,
          chain:         d.investigation?.chain,
          victimAddress: d.investigation?.victimAddress,
          suspectAddress:d.investigation?.suspectAddress,
          netLoss:       d.investigation?.moneyFlow?.netLoss || 0,
          linkedTxCount: d.investigation?.linkedTransactions?.length || 0,
        };
      } catch { return null; }
    })
  );
  return summaries.filter(Boolean).sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
}

export async function getCaseById(id) {
  const filePath = join(CASES_DIR, `${id}.json`);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}
