const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─── POST /api/feasibility — mock feasibility check ──────────────────────────
// Body: { lab_id, project_description, equipment_needed: [], duration_days }
router.post('/', (req, res) => {
  const { lab_id, project_description, equipment_needed = [], duration_days = 1 } = req.body;

  if (!lab_id) return res.status(400).json({ error: 'lab_id required' });

  const lab = db.prepare(`
    SELECT l.*, u.name FROM labs l JOIN users u ON u.id = l.user_id WHERE l.id = ?
  `).get(lab_id);

  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  const labEquipment = JSON.parse(lab.equipment_json || '[]');
  const labServices  = JSON.parse(lab.services_json  || '[]');
  const labCerts     = JSON.parse(lab.certifications_json || '[]');

  // Calculate equipment match score
  const needed = Array.isArray(equipment_needed) ? equipment_needed : [];
  let matchCount = 0;
  const matchedItems = [];
  const missingItems = [];

  needed.forEach(item => {
    const found = labEquipment.some(eq => eq.toLowerCase().includes(item.toLowerCase())) ||
                  labServices.some(svc => svc.toLowerCase().includes(item.toLowerCase()));
    if (found) {
      matchCount++;
      matchedItems.push(item);
    } else {
      missingItems.push(item);
    }
  });

  const matchRatio = needed.length > 0 ? matchCount / needed.length : 1;

  // Determine verdict
  let verdict, riskLevel, estimatedCost, estimatedTime;

  if (matchRatio >= 0.8) {
    verdict = 'Feasible';
    riskLevel = 'Low';
  } else if (matchRatio >= 0.5) {
    verdict = 'Conditional';
    riskLevel = 'Medium';
  } else {
    verdict = 'Not Feasible';
    riskLevel = 'High';
  }

  // Estimate cost based on duration
  const days = Math.max(1, parseInt(duration_days) || 1);
  const baseCost = lab.price_per_day * days;
  const setupFee = days > 1 ? 200 : 100;
  estimatedCost = baseCost + setupFee;

  // Estimate time (setup + project days + report)
  const setupDays = 1;
  const reportDays = 1;
  estimatedTime = `${setupDays + days + reportDays} working days`;

  // Keywords from description that match lab expertise
  const desc = (project_description || '').toLowerCase();
  const relevantServices = labServices.filter(svc =>
    desc.includes(svc.toLowerCase().split(' ')[0]) ||
    svc.toLowerCase().split(' ').some(word => desc.includes(word))
  );

  res.json({
    verdict,
    risk_level: riskLevel,
    estimated_cost: estimatedCost,
    estimated_time: estimatedTime,
    equipment_match: {
      score: Math.round(matchRatio * 100),
      matched: matchedItems,
      missing: missingItems,
      available: labEquipment,
    },
    relevant_services: relevantServices,
    certifications: labCerts,
    capacity: lab.capacity,
    recommendation: getRecommendation(verdict, missingItems, lab.name),
    lab_name: lab.name,
  });
});

function getRecommendation(verdict, missing, labName) {
  if (verdict === 'Feasible') {
    return `${labName} is well-equipped to support your project. We recommend scheduling a pre-visit call with the lab manager to align on safety protocols and access logistics.`;
  }
  if (verdict === 'Conditional') {
    const missingStr = missing.length > 0 ? ` Missing equipment: ${missing.join(', ')}.` : '';
    return `Your project is partially feasible at ${labName}.${missingStr} Consider contacting the lab about equipment rental from partner facilities or adjusting project scope.`;
  }
  return `${labName} may not have all equipment needed for your project as described. We recommend browsing our other lab facilities or consulting with an expert to refine your technical requirements.`;
}

module.exports = router;
