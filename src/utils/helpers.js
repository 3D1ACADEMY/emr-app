export const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (prefix = 'EMR') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const calculateHyaluronidase = (zoneValue, severityValue) => {
  // Dynamic import to avoid circular dependency
  const { HYALURONIDASE_ZONES, SEVERITY_OPTIONS } = require('../constants/emergencyData');
  const zone = HYALURONIDASE_ZONES.find((z) => z.value === zoneValue) || HYALURONIDASE_ZONES[0];
  const severity = SEVERITY_OPTIONS.find((s) => s.value === severityValue) || SEVERITY_OPTIONS[0];
  const totalDose = zone.baseDose + severity.doseAdjustment;
  const concentrationIuPerMl = 1500; // CMAC: 1,500 IU reconstituted in 1.0 mL
  const volumeMl = totalDose / concentrationIuPerMl;
  return {
    zone,
    severity,
    totalDose,
    volumeMl,
    concentrationIuPerMl,
    instructions: `${zone.instructions} ${severity.note}`,
    storage: zone.storage || '',
  };
};

export const calculateEpinephrine = (weightKg) => {
  const adultDose = 0.3; // mg
  const pediatricDose = Math.min(0.3, Math.max(0.15, weightKg * 0.01));
  const isAdult = weightKg >= 40;
  return {
    dose: isAdult ? adultDose : pediatricDose,
    concentration: '1:1000 (1 mg/mL)',
    route: 'IM into anterolateral thigh',
    repeat: 'Repeat every 5-15 min if no improvement',
    note: isAdult ? 'Adult dose 0.3-0.5 mg IM' : `Pediatric dose ${pediatricDose.toFixed(2)} mg IM`,
  };
};
