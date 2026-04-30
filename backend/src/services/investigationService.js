import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const ETHERSCAN  = 'https://api.etherscan.io/api';
const BTCINFO    = 'https://blockchain.info';

// ── Address type detection ───────────────────────────────────────────────────
export function detectChain(address) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address))                          return 'ETH';
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)) return 'BTC';
  return 'UNKNOWN';
}

// ── Etherscan helpers ────────────────────────────────────────────────────────
const apiKey = () => process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';

async function etherscan(params) {
  const qs = new URLSearchParams({ ...params, apikey: apiKey() }).toString();
  const res = await fetch(`${ETHERSCAN}?${qs}`);
  if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`);
  const json = await res.json();
  if (json.status === '0' && json.message !== 'No transactions found') {
    if (json.result && typeof json.result === 'string' && json.result.includes('rate limit')) {
      throw new Error('Etherscan rate limit — add ETHERSCAN_API_KEY to .env for unlimited access');
    }
  }
  return Array.isArray(json.result) ? json.result : [];
}

async function fetchEthNormalTxs(address) {
  return etherscan({ module: 'account', action: 'txlist', address, startblock: 0, endblock: 99999999, sort: 'asc' });
}

async function fetchEthTokenTxs(address) {
  return etherscan({ module: 'account', action: 'tokentx', address, startblock: 0, endblock: 99999999, sort: 'asc' });
}

async function fetchEthBalance(address) {
  const res = await etherscan({ module: 'account', action: 'balance', address, tag: 'latest' });
  return parseFloat(res) / 1e18 || 0;
}

// ── Bitcoin helpers ───────────────────────────────────────────────────────────
async function fetchBtcData(address) {
  const res = await fetch(`${BTCINFO}/rawaddr/${address}?limit=100`);
  if (!res.ok) throw new Error(`blockchain.info HTTP ${res.status}`);
  return res.json();
}

// ── Linked-transaction analysis ───────────────────────────────────────────────
function linkEth(txs, victim, suspect) {
  const v = victim.toLowerCase();
  const s = suspect.toLowerCase();
  return txs.filter(tx =>
    (tx.from?.toLowerCase() === v && tx.to?.toLowerCase() === s) ||
    (tx.from?.toLowerCase() === s && tx.to?.toLowerCase() === v)
  );
}

function weiToEth(wei) { return parseFloat(wei) / 1e18; }

// ── Main investigation function ───────────────────────────────────────────────
export async function investigateWallets({ victimAddress, suspectAddress, chain = 'auto' }) {
  const resolved = chain === 'auto' ? detectChain(victimAddress) : chain.toUpperCase();

  if (resolved === 'UNKNOWN') {
    throw new Error(`Cannot detect blockchain for address: ${victimAddress}. Supported: Ethereum (0x...) and Bitcoin.`);
  }

  // ── Ethereum / EVM ──────────────────────────────────────────────────────────
  if (resolved === 'ETH') {
    const [victimTxs, suspectTxs, victimTokenTxs, suspectBalance] = await Promise.all([
      fetchEthNormalTxs(victimAddress),
      fetchEthNormalTxs(suspectAddress),
      fetchEthTokenTxs(victimAddress),
      fetchEthBalance(suspectAddress),
    ]);

    const linkedTxs    = linkEth(victimTxs,      victimAddress, suspectAddress);
    const linkedTokens = linkEth(victimTokenTxs, victimAddress, suspectAddress);

    // Funds flow: victim → suspect
    const victimToSuspect = linkedTxs.filter(tx => tx.from.toLowerCase() === victimAddress.toLowerCase());
    const suspectToVictim = linkedTxs.filter(tx => tx.from.toLowerCase() === suspectAddress.toLowerCase());

    const totalEthLost = victimToSuspect.reduce((s, tx) => s + weiToEth(tx.value), 0);
    const totalEthReturned = suspectToVictim.reduce((s, tx) => s + weiToEth(tx.value), 0);

    // Where suspect sent funds next (follow the money)
    const suspectOutgoing = suspectTxs
      .filter(tx => tx.from.toLowerCase() === suspectAddress.toLowerCase() && tx.value !== '0')
      .reduce((acc, tx) => {
        const addr = tx.to.toLowerCase();
        if (!acc[addr]) acc[addr] = { address: tx.to, totalEth: 0, txCount: 0 };
        acc[addr].totalEth  += weiToEth(tx.value);
        acc[addr].txCount   += 1;
        return acc;
      }, {});

    const timestamps = linkedTxs.map(tx => parseInt(tx.timeStamp)).filter(Boolean);

    return {
      chain:          'ETH',
      victimAddress,
      suspectAddress,
      suspectCurrentBalance: suspectBalance,
      victimTxCount:  victimTxs.length,
      suspectTxCount: suspectTxs.length,
      linkedTransactions: linkedTxs.map(tx => ({
        hash:      tx.hash,
        date:      new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        direction: tx.from.toLowerCase() === victimAddress.toLowerCase() ? 'VICTIM→SUSPECT' : 'SUSPECT→VICTIM',
        amountEth: weiToEth(tx.value).toFixed(6),
        amountWei: tx.value,
        gasUsed:   tx.gasUsed,
        status:    tx.txreceipt_status === '1' ? 'SUCCESS' : 'FAILED',
        explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
      })),
      linkedTokenTransfers: linkedTokens.map(tx => ({
        hash:        tx.hash,
        date:        new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        tokenName:   tx.tokenName,
        tokenSymbol: tx.tokenSymbol,
        amount:      (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(4),
        direction:   tx.from.toLowerCase() === victimAddress.toLowerCase() ? 'VICTIM→SUSPECT' : 'SUSPECT→VICTIM',
        explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
      })),
      moneyFlow: {
        totalEthLost,
        totalEthReturned,
        netLoss: totalEthLost - totalEthReturned,
      },
      suspectOutgoingAddresses: Object.values(suspectOutgoing)
        .sort((a, b) => b.totalEth - a.totalEth)
        .slice(0, 10),
      timeline: {
        firstContact: timestamps.length ? new Date(Math.min(...timestamps) * 1000).toISOString() : null,
        lastContact:  timestamps.length ? new Date(Math.max(...timestamps) * 1000).toISOString() : null,
        durationDays: timestamps.length
          ? Math.ceil((Math.max(...timestamps) - Math.min(...timestamps)) / 86400)
          : 0,
      },
    };
  }

  // ── Bitcoin ─────────────────────────────────────────────────────────────────
  if (resolved === 'BTC') {
    const [victimData, suspectData] = await Promise.all([
      fetchBtcData(victimAddress),
      fetchBtcData(suspectAddress),
    ]);

    const victimTxIds = new Set((victimData.txs || []).map(tx => tx.hash));
    const linked = (suspectData.txs || []).filter(tx => victimTxIds.has(tx.hash));

    const totalBtcLost = linked.reduce((sum, tx) => {
      const out = tx.out?.find(o => o.addr === suspectAddress);
      return sum + (out ? out.value / 1e8 : 0);
    }, 0);

    return {
      chain:          'BTC',
      victimAddress,
      suspectAddress,
      victimTxCount:  victimData.n_tx || 0,
      suspectTxCount: suspectData.n_tx || 0,
      suspectBalance: (suspectData.final_balance || 0) / 1e8,
      linkedTransactions: linked.map(tx => ({
        hash:        tx.hash,
        date:        new Date(tx.time * 1000).toISOString(),
        explorerUrl: `https://www.blockchain.com/btc/tx/${tx.hash}`,
      })),
      moneyFlow: {
        totalBtcLost,
        netLoss: totalBtcLost,
      },
      timeline: {
        firstContact: linked.length ? new Date(Math.min(...linked.map(t => t.time)) * 1000).toISOString() : null,
        lastContact:  linked.length ? new Date(Math.max(...linked.map(t => t.time)) * 1000).toISOString() : null,
      },
    };
  }
}
