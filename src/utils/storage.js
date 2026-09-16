import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PATIENTS: '@emr_patients',
  INCIDENTS: '@emr_incidents',
  SETTINGS: '@emr_settings',
  CHECKLISTS: '@emr_checklists',
};

export const storage = {
  async getPatients() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading patients:', e);
      return [];
    }
  },

  async savePatient(patient) {
    try {
      const patients = await this.getPatients();
      const index = patients.findIndex((p) => p.id === patient.id);
      if (index >= 0) {
        patients[index] = { ...patients[index], ...patient, updatedAt: Date.now() };
      } else {
        patients.push({
          ...patient,
          id: patient.id || `P-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
      return patients;
    } catch (e) {
      console.error('Error saving patient:', e);
      throw e;
    }
  },

  async getIncidents() {
    try {
      const data = await AsyncStorage.getItem(KEYS.INCIDENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading incidents:', e);
      return [];
    }
  },

  async saveIncident(incident) {
    try {
      const incidents = await this.getIncidents();
      const index = incidents.findIndex((i) => i.id === incident.id);
      if (index >= 0) {
        incidents[index] = { ...incidents[index], ...incident, updatedAt: Date.now() };
      } else {
        incidents.push({
          ...incident,
          id: incident.id || `I-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      await AsyncStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents));
      return incidents;
    } catch (e) {
      console.error('Error saving incident:', e);
      throw e;
    }
  },

  async getChecklistState(incidentId) {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.CHECKLISTS}:${incidentId}`);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  async saveChecklistState(incidentId, state) {
    try {
      await AsyncStorage.setItem(`${KEYS.CHECKLISTS}:${incidentId}`, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving checklist state:', e);
    }
  },

  async deletePatient(id) {
    try {
      const patients = await this.getPatients();
      const filtered = patients.filter((p) => p.id !== id);
      await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      console.error('Error deleting patient:', e);
      throw e;
    }
  },

  async deleteIncident(id) {
    try {
      const incidents = await this.getIncidents();
      const filtered = incidents.filter((i) => i.id !== id);
      await AsyncStorage.setItem(KEYS.INCIDENTS, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      console.error('Error deleting incident:', e);
      throw e;
    }
  },

  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const emrKeys = keys.filter((k) => k.startsWith('@emr_'));
      await AsyncStorage.multiRemove(emrKeys);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};
