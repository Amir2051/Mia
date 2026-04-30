import { Router } from 'express';
import { investigateWallets } from '../services/investigationService.js';
import { generateCaseProfile, listCases, getCaseById } from '../services/caseProfileService.js';

const router = Router();

// POST /api/investigate — run investigation + generate case profile
router.post('/', async (req, res, next) => {
  try {
    const {
      victimAddress, suspectAddress,
      chain = 'auto',
      notes = '',
      fraudType = 'Cryptocurrency Fraud'
    } = req.body;

    if (!victimAddress?.trim() || !suspectAddress?.trim()) {
      return res.status(400).json({ error: 'victimAddress and suspectAddress are required' });
    }

    const investigationData = await investigateWallets({ victimAddress: victimAddress.trim(), suspectAddress: suspectAddress.trim(), chain });
    const { profile, jsonPath, reportPath, caseId } = await generateCaseProfile({ investigationData, userNotes: notes, fraudType });

    res.json({ success: true, caseId, savedFiles: { json: jsonPath, report: reportPath }, profile });
  } catch (err) {
    next(err);
  }
});

// GET /api/investigate/cases — list all saved cases
router.get('/cases', async (req, res, next) => {
  try {
    const cases = await listCases();
    res.json(cases);
  } catch (err) { next(err); }
});

// GET /api/investigate/cases/:id — get full case profile
router.get('/cases/:id', async (req, res, next) => {
  try {
    const profile = await getCaseById(req.params.id);
    res.json(profile);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Case not found' });
    next(err);
  }
});

export default router;
