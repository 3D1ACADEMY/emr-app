// Clinical Emergency Management System (CEMS) protocols
// 3D Rejuvenation Academy | Dr. Amr Ismail, MD

export const PROTOCOLS = {
  vascularOcclusion: {
    id: 'vascular-occlusion',
    title: 'Vascular Occlusion',
    icon: 'heart-pulse',
    color: '#dc2626',
    badge: 'CRITICAL',
    description: 'Filler-induced vascular compromise requiring immediate reversal.',
    steps: [
      {
        id: 'vo-1',
        text: 'STOP Injection: Cease procedure immediately and remove all product delivery devices.',
        critical: true,
      },
      {
        id: 'vo-2',
        text: 'Assess Red Flags: Confirm unremitting pain, blanching / livedo reticularis, & CRT > 2 seconds.',
        critical: true,
      },
      {
        id: 'vo-3',
        text: 'Apply warm compresses to encourage localized micro-vasodilation.',
        critical: false,
      },
      {
        id: 'vo-4',
        text: 'Consider topical 2% nitroglycerin paste & 325 mg oral aspirin.',
        critical: false,
      },
      {
        id: 'vo-5',
        text: 'Administer hyaluronidase per calculator. Repeat every 15-30 min until reperfusion.',
        critical: true,
      },
      {
        id: 'vo-6',
        text: 'Document timeline, photos, doses, and patient response.',
        critical: false,
      },
    ],
  },
  anaphylaxis: {
    id: 'anaphylaxis',
    title: 'Anaphylaxis',
    icon: 'alert-circle',
    color: '#f59e0b',
    badge: 'CRITICAL',
    description: 'Severe allergic reaction with airway/breathing/circulatory compromise.',
    steps: [
      { id: 'an-1', text: 'Call for help. Position supine with legs elevated.', critical: true },
      { id: 'an-2', text: 'Administer IM epinephrine 1:1000, 0.3-0.5 mg (adults) lateral thigh.', critical: true },
      { id: 'an-3', text: 'Establish/maintain airway. Give high-flow oxygen.', critical: true },
      { id: 'an-4', text: 'Establish IV access. Give rapid crystalloid bolus if hypotensive.', critical: true },
      { id: 'an-5', text: 'Adjuncts: nebulized albuterol, H1/H2 antihistamines, corticosteroids.', critical: false },
      { id: 'an-6', text: 'Monitor for biphasic reaction. Observe minimum 4-6 hours.', critical: false },
    ],
  },
  localAnestheticToxicity: {
    id: 'lat',
    title: 'Local Anesthetic Toxicity',
    icon: 'flash',
    color: '#a9843f',
    badge: 'URGENT',
    description: 'CNS/cardiovascular toxicity from local anesthetic overdose.',
    steps: [
      { id: 'lat-1', text: 'Stop injection. Call for help and prepare resuscitation.', critical: true },
      { id: 'lat-2', text: 'Manage airway, give oxygen, support ventilation.', critical: true },
      { id: 'lat-3', text: 'Treat seizures with benzodiazepines. Avoid propofol in cardiovascular collapse.', critical: true },
      { id: 'lat-4', text: 'If cardiac arrest: start CPR and give Intralipid 20% emulsion bolus 1.5 mL/kg.', critical: true },
      { id: 'lat-5', text: 'Continue Intralipid infusion 0.25 mL/kg/min for 10 min; repeat bolus if unstable.', critical: false },
    ],
  },
  hematoma: {
    id: 'hematoma',
    title: 'Acute Hematoma',
    icon: 'droplet',
    color: '#dc2626',
    badge: 'URGENT',
    description: 'Rapid swelling from vessel injury during injection.',
    steps: [
      { id: 'hem-1', text: 'Stop procedure. Apply firm direct pressure immediately.', critical: true },
      { id: 'hem-2', text: 'Assess airway compromise (neck/periorbital hematoma).', critical: true },
      { id: 'hem-3', text: 'Cold compress. Avoid aspirin/NSAIDs if possible.', critical: false },
      { id: 'hem-4', text: 'Consider tranexamic acid, arnica, or surgical evacuation if expanding.', critical: false },
      { id: 'hem-5', text: 'Document extent, photos, and neurovascular status.', critical: false },
    ],
  },
  syncope: {
    id: 'syncope',
    title: 'Vasovagal Syncope',
    icon: 'account-alert',
    color: '#3b82f6',
    badge: 'COMMON',
    description: 'Sudden brief loss of consciousness due to vagal stimulus.',
    steps: [
      { id: 'syn-1', text: 'Stop procedure. Lower head, elevate legs.', critical: true },
      { id: 'syn-2', text: 'Loosen tight clothing. Ensure airway is open.', critical: true },
      { id: 'syn-3', text: 'Apply cool compress to forehead/neck. Offer water once awake.', critical: false },
      { id: 'syn-4', text: 'Monitor pulse, BP, and consciousness. Do not resume until fully recovered.', critical: true },
      { id: 'syn-5', text: 'If recovery is delayed or atypical, activate emergency services.', critical: false },
    ],
  },
  herpesOutbreak: {
    id: 'herpes-outbreak',
    title: 'Herpes Simplex Outbreak',
    icon: 'virus',
    color: '#f59e0b',
    badge: 'URGENT',
    description: 'Reactivation of HSV after lip/perioral procedure.',
    steps: [
      { id: 'hsp-1', text: 'Stop procedure in affected area. Do not inject through active lesions.', critical: true },
      { id: 'hsp-2', text: 'Start antiviral therapy promptly (valacyclovir/acyclovir).', critical: true },
      { id: 'hsp-3', text: 'Advise patient on hygiene, avoidance of touching, and contagion precautions.', critical: false },
      { id: 'hsp-4', text: 'Document lesion distribution and start treatment time.', critical: false },
      { id: 'hsp-5', text: 'Follow up within 24-48 hours; escalate if disseminated or ocular involvement.', critical: false },
    ],
  },
  infection: {
    id: 'infection',
    title: 'Procedure-Related Infection',
    icon: 'bacteria',
    color: '#dc2626',
    badge: 'URGENT',
    description: 'Bacterial infection at injection site with erythema, warmth, pain.',
    steps: [
      { id: 'inf-1', text: 'Assess severity: localized cellulitis vs abscess vs systemic signs.', critical: true },
      { id: 'inf-2', text: 'Obtain culture if purulent drainage present. Do not manipulate nodules.', critical: false },
      { id: 'inf-3', text: 'Start empiric oral antibiotics covering skin flora (e.g., cephalexin, doxycycline if MRSA risk).', critical: true },
      { id: 'inf-4', text: 'If abscess: consider incision & drainage by qualified provider.', critical: true },
      { id: 'inf-5', text: 'Arrange 24-48 hour follow-up; escalate if fever, spreading erythema, or immunocompromised.', critical: true },
    ],
  },
  nodulesTyndall: {
    id: 'nodules-tyndall',
    title: 'Filler Nodules / Tyndall Effect',
    icon: 'texture-box',
    color: '#a9843f',
    badge: 'NON-URGENT',
    description: 'Visible or palpable filler irregularities after injection.',
    steps: [
      { id: 'nt-1', text: 'Examine and differentiate: product aggregation, granuloma, or bluish Tyndall effect.', critical: false },
      { id: 'nt-2', text: 'For hyaluronic acid nodules: massage and consider hyaluronidase injection.', critical: false },
      { id: 'nt-3', text: 'Tyndall effect: hyaluronidase or puncture/exprimation by experienced injector.', critical: false },
      { id: 'nt-4', text: 'Non-HA or persistent granuloma: refer for specialist management; steroids may be indicated.', critical: false },
      { id: 'nt-5', text: 'Document with photos and schedule follow-up.', critical: false },
    ],
  },
  complexVORescue: {
    id: 'complex-vo-rescue',
    title: 'Complex VO Rescue',
    icon: 'skull-crossbones',
    color: '#7f1d1d',
    badge: 'MASTERCLASS',
    premium: true,
    description: 'Advanced vascular occlusion rescue protocol for refractory or delayed cases.',
    steps: [
      { id: 'cvo-1', text: 'Escalate immediately: high-dose hyaluronidase (600+ IU) across multiple planes and access points.', critical: true },
      { id: 'cvo-2', text: 'Add intra-arterial thrombolysis protocol if available within 4-6 hours of onset.', critical: true },
      { id: 'cvo-3', text: 'Hyperbaric oxygen therapy consult for threatened tissue.', critical: false },
      { id: 'cvo-4', text: 'High-resolution Doppler ultrasound to map flow and guide reversal.', critical: false },
      { id: 'cvo-5', text: 'Continuous monitoring, photograph timeline, and urgent specialist referral.', critical: true },
      { id: 'cvo-6', text: 'Document all interventions with exact timestamps for medicolegal review.', critical: false },
    ],
  },
};

export const HYALURONIDASE_ZONES = [
  {
    value: 'glabella',
    label: 'Glabella / Nasal Dorsum (High Risk)',
    baseDose: 300,
    instructions:
      'Inject 300 IU minimum. Reconstitute 150 IU/mL vial with 1.0 mL normal saline. Infiltrate grid pattern across supratrochlear/dorsal pathways (0.1 mL per puncture every 0.5 cm).',
  },
  {
    value: 'nasal',
    label: 'Nasal Tip / Alar Sidewall',
    baseDose: 300,
    instructions:
      'Inject 300 IU minimum along nasal sidewall and tip. Reconstitute 150 IU/mL vial with 1.0 mL normal saline. Use serial micro-punctures along alar and dorsal arteries.',
  },
  {
    value: 'lip',
    label: 'Lips / Perioral Field',
    baseDose: 150,
    instructions:
      'Inject 150–225 IU along mucosal and submucosal planes of the labial arcade. Distribute evenly across ischemic segments.',
  },
  {
    value: 'cheek',
    label: 'Mid-Face / Cheek Vector',
    baseDose: 300,
    instructions:
      'Inject 300 IU minimum along the trajectory of the facial/angular artery. Re-evaluate perfusion at 30 minutes.',
  },
  {
    value: 'temple',
    label: 'Temple / Lateral Brow',
    baseDose: 300,
    instructions:
      'Inject 300 IU in superficial and deep temporal planes. Target superficial temporal artery distribution.',
  },
  {
    value: 'forehead',
    label: 'Forehead / Supraorbital',
    baseDose: 300,
    instructions:
      'Inject 300 IU tracking the supraorbital/supratrochlear vessels. Use fanning infiltration across the affected region.',
  },
];

export const SEVERITY_OPTIONS = [
  {
    value: 'localized',
    label: 'Localized (< 1 cm² / Early Catch)',
    doseAdjustment: 0,
    note: 'Start with base dose. Reassess every 15 min.',
  },
  {
    value: 'widespread',
    label: 'Widespread / Reticular Spread',
    doseAdjustment: 150,
    note: 'Scale total initial dose to 450+ IU across multi-site grid.',
  },
  {
    value: 'severe',
    label: 'Severe / Tissue Threatened',
    doseAdjustment: 300,
    note: 'High-dose protocol: consider 600+ IU split across multiple access points.',
  },
];

export const EPINEPHRINE_WEIGHTS = Array.from({ length: 40 }, (_, i) => (i + 4) * 5);

export const INCIDENT_FIELDS = [
  { id: 'patientId', label: 'Patient ID / Initials', type: 'text' },
  { id: 'procedure', label: 'Procedure Being Performed', type: 'text' },
  { id: 'product', label: 'Product / Agent Used', type: 'text' },
  { id: 'onsetTime', label: 'Onset Time', type: 'time' },
  { id: 'location', label: 'Anatomical Location', type: 'text' },
  { id: 'symptoms', label: 'Signs & Symptoms', type: 'multiline' },
  { id: 'interventions', label: 'Interventions Given', type: 'multiline' },
  { id: 'outcome', label: 'Outcome / Follow-up', type: 'multiline' },
];
