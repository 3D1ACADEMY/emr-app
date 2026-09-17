// Legacy storage shim — now backed by expo-secure-store.
// All PHI is encrypted at rest.

import {
  getPatients,
  savePatient,
  deletePatient,
  getIncidents,
  saveIncident,
  deleteIncident,
  getChecklistState,
  saveChecklistState,
  clearAll,
} from './secureStorage';

export const storage = {
  getPatients,
  savePatient,
  deletePatient,
  getIncidents,
  saveIncident,
  deleteIncident,
  getChecklistState,
  saveChecklistState,
  clearAll,
};
