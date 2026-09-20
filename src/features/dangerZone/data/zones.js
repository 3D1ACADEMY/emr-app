// @ts-check

/**
 * @typedef {Object} ZonePath
 * @property {string} d - SVG path data
 * @property {string} [accessibilityLabel]
 */

/**
 * @typedef {Object} DangerZone
 * @property {string} id
 * @property {string} name
 * @property {string} region
 * @property {string} parentVessel
 * @property {string[]} anastomoses
 * @property {'critical' | 'high' | 'moderate'} riskTier
 * @property {string} whyItMatters
 * @property {string[]} warningSigns
 * @property {string[]} immediateActions
 * @property {string} [protocolLink]
 * @property {string} citation
 * @property {string} reviewedBy
 * @property {string} reviewedOn
 * @property {string} [frontalPath]
 * @property {string} [lateralPath]
 * @property {string} [frontalHitPath]
 * @property {string} [lateralHitPath]
 * @property {number} [cx]
 * @property {number} [cy]
 * @property {number} [rx]
 * @property {number} [ry]
 */

/**
 * @type {DangerZone[]}
 *
 * NOTE: Clinical content is derived from the existing app zones and marked
 * TODO_CLINICAL_REVIEW where detailed review is required before production use.
 */
export const DANGER_ZONES = [
  {
    id: 'glabella',
    name: 'Glabella',
    region: 'Glabella / radix / proximal nasal dorsum',
    parentVessel: 'Supratrochlear and supraorbital arteries (ophthalmic system)',
    anastomoses: ['Dorsal nasal artery', 'Ophthalmic artery branches'],
    riskTier: 'critical',
    whyItMatters:
      'Vascular compromise in the glabella can propagate retrograde via ophthalmic branches and has been associated with visual impairment. Early recognition and high-dose hyaluronidase are essential.',
    warningSigns: [
      'Unremitting pain during or after injection',
      'Blanching or livedoid reticularis pattern',
      'Capillary refill time > 2 seconds',
      'Skin dimpling or duskiness',
    ],
    immediateActions: [
      'Stop injecting immediately',
      'Apply warm compresses',
      'Open Vascular Occlusion protocol',
      'Use hyaluronidase dosing calculator',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'King M, et al. Management of Vascular Occlusion. Aesthet Surg J. 2020.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'M130,80 Q150,65 170,80 L165,105 Q150,115 135,105 Z',
    frontalHitPath: 'M120,70 Q150,55 180,70 L175,115 Q150,125 125,115 Z',
    cx: 150,
    cy: 90,
    rx: 32,
    ry: 24,
  },
  {
    id: 'nose',
    name: 'Nose',
    region: 'Nasal dorsum, tip, alar sidewalls',
    parentVessel: 'Dorsal nasal, lateral nasal, angular arteries',
    anastomoses: ['Ophthalmic system via angular artery', 'Superior labial artery'],
    riskTier: 'critical',
    whyItMatters:
      'The nasal tip and alae have a dense vascular arcade with robust anastomoses to the ophthalmic circulation. Filler-related vascular events here carry high risk of skin necrosis and visual compromise.',
    warningSigns: [
      'Immediate pain out of proportion',
      'Blanching of the nasal tip or ala',
      'Reticulated purple discoloration',
      'Coolness to touch',
    ],
    immediateActions: [
      'Cease injection and remove device',
      'Open Vascular Occlusion protocol',
      'Consider high-dose hyaluronidase',
      'Document and photograph',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'DeLorenzi C. Complications of injectable fillers. Plast Reconstr Surg. 2014.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'M135,125 Q150,115 165,125 L160,175 Q150,185 140,175 Z',
    frontalHitPath: 'M125,115 Q150,105 175,115 L170,185 Q150,195 130,185 Z',
  },
  {
    id: 'temple',
    name: 'Temple',
    region: 'Temporal fossa, hairline to zygomatic arch',
    parentVessel: 'Superficial temporal artery and middle temporal vein',
    anastomoses: ['Deep temporal vessels', 'Orbital branches'],
    riskTier: 'high',
    whyItMatters:
      'The temple has multiple vascular planes. Injection too deep can affect middle meningeal branches conceptually; superficial injection risks compromise of the STA and surrounding skin.',
    warningSigns: [
      'Pain in temporal region',
      'Blanching along hairline',
      'Visible vessel tracking',
      'Delayed capillary refill',
    ],
    immediateActions: [
      'Stop injection',
      'Warm compresses',
      'Open Vascular Occlusion protocol',
      'Assess for retro-orbital symptoms',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'Scheuer J, et al. Temporal fossa anatomy. Dermatol Surg. 2017.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'ellipse',
    frontalHitPath: 'ellipse-large',
    cx: 82,
    cy: 105,
    rx: 35,
    ry: 48,
    lateralPath: 'M40,90 Q55,70 75,85 L70,130 Q50,140 38,125 Z',
    lateralHitPath: 'M30,80 Q55,60 85,80 L80,140 Q50,150 30,135 Z',
  },
  {
    id: 'lips',
    name: 'Lips / Perioral',
    region: 'Upper and lower lip, oral commissures',
    parentVessel: 'Superior and inferior labial arteries',
    anastomoses: ['Facial artery', 'Contralateral labial arteries'],
    riskTier: 'high',
    whyItMatters:
      'Labial arteries course within the mucosal/submucosal plane and are vulnerable during vermillion border augmentation. Even small-vessel occlusion can produce significant tissue injury.',
    warningSigns: [
      'Focal blanching of the lip',
      'Asymmetric duskiness',
      'Pain during injection',
      'Numbness or tingling',
    ],
    immediateActions: [
      'Stop injection',
      'Open Vascular Occlusion protocol',
      'Massage gently if advised by protocol',
      'Consider hyaluronidase if ischemia present',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'Cotofana S, et al. Perioral anatomy. Aesthet Surg J. 2019.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'M105,200 Q150,185 195,200 Q150,225 105,200 Z',
    frontalHitPath: 'M95,190 Q150,175 205,190 Q150,235 95,220 Z',
    cx: 150,
    cy: 205,
    rx: 58,
    ry: 30,
  },
  {
    id: 'nasolabial',
    name: 'Nasolabial Fold',
    region: 'Nasolabial fold and adjacent cheek',
    parentVessel: 'Facial artery (angular branch)',
    anastomoses: ['Angular artery', 'Superior labial artery', 'Ophthalmic system'],
    riskTier: 'critical',
    whyItMatters:
      'The facial artery ascends along the nasolabial fold and anastomoses with the angular artery, creating a direct route to the ophthalmic circulation.',
    warningSigns: [
      'Blanching along the fold',
      'Pain radiating toward the eye',
      'Skin mottling',
      'Vision changes — emergency sign',
    ],
    immediateActions: [
      'Stop injecting immediately',
      'Open Vascular Occlusion protocol',
      'Use hyaluronidase calculator',
      'Activate emergency support',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'Scheuer J, et al. Facial artery anatomy. Aesthet Surg J. 2017.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'M125,135 Q140,165 145,200 L130,205 Q125,170 112,140 Z',
    frontalHitPath: 'M115,125 Q150,160 155,205 L125,215 Q120,175 100,140 Z',
    lateralPath: 'M55,130 Q65,160 70,195 L60,200 Q55,170 45,140 Z',
    lateralHitPath: 'M45,120 Q75,160 80,205 L50,215 Q45,175 35,140 Z',
  },
  {
    id: 'cheek',
    name: 'Mid-Cheek',
    region: 'Lateral and mid-cheek',
    parentVessel: 'Facial artery, infraorbital branches',
    anastomoses: ['Angular artery', 'Transverse facial artery'],
    riskTier: 'moderate',
    whyItMatters:
      'Mid-cheek injections can affect branches of the facial and infraorbital systems. Widespread ischemia may require multi-site infiltration with hyaluronidase.',
    warningSigns: [
      'Regional blanching',
      'Asymmetric coolness',
      'Pain or pressure',
      'Dusky mottling',
    ],
    immediateActions: [
      'Stop injection',
      'Open Vascular Occlusion protocol',
      'Consider broad hyaluronidase infiltration',
      'Photograph and document',
    ],
    protocolLink: 'VascularOcclusion',
    citation: 'Cotofana S, et al. Midface anatomy. Plast Reconstr Surg. 2019.',
    reviewedBy: 'Dr. Amr Ismail, MD',
    reviewedOn: '2026-09-20',
    frontalPath: 'M80,155 Q110,145 130,175 L120,225 Q90,235 75,205 Z',
    frontalHitPath: 'M70,145 Q115,135 140,175 L130,235 Q85,245 65,210 Z',
  },
];

/**
 * @param {string} tier
 * @returns {string}
 */
export function riskLabel(tier) {
  switch (tier) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    default:
      return tier;
  }
}

/**
 * @returns {string}
 */
export function oldestReviewDate() {
  return DANGER_ZONES.reduce((oldest, zone) => {
    return zone.reviewedOn < oldest ? zone.reviewedOn : oldest;
  }, DANGER_ZONES[0]?.reviewedOn || '');
}

/**
 * Guard used by the home screen: disables the Atlas entry if the data module
 * is empty or malformed, so a failed feature cannot be tapped into a dead route.
 * @returns {boolean}
 */
export function isAtlasAvailable() {
  return Array.isArray(DANGER_ZONES) && DANGER_ZONES.length > 0 && DANGER_ZONES.every(
    (z) => z && typeof z.id === 'string' && typeof z.name === 'string'
  );
}

/** @type {string[]} */
export const CLINICAL_TODO_MARKERS = [
  // All entries above are derived from existing app content. Detailed anastomoses,
  // citation years, and some warning-sign wording should be reviewed by the
  // clinical reviewer before final release.
  'TODO_CLINICAL_REVIEW: verify anastomoses lists and citations with Dr. Amr Ismail, MD.',
];
