import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PATIENT_IDS: '@emr_secure_patient_ids',
  INCIDENT_IDS: '@emr_secure_incident_ids',
  CHECKLIST_PREFIX: '@emr_secure_checklist:',
  DISCLAIMER_ACCEPTED: '@emr_secure_disclaimer_accepted',
  PIN_HASH: '@emr_secure_pin_hash',
  PIN_SALT: '@emr_secure_pin_salt',
  UNLOCK_CODE: '@emr_secure_unlock_code',
};

const ASYNC_KEYS = {
  INCIDENT_PREFIX: '@emr_incident:',
  PATIENT_PREFIX: '@emr_patient:',
};

const FALLBACK_KEYS = {
  PATIENT_IDS: '@emr_patient_ids',
  INCIDENT_IDS: '@emr_incident_ids',
};

export const VALID_UNLOCK_CODES = ['3DREJUV2026', 'MASTERCLASS'];

const OPTIONS = {
  keychainService: 'com.rejuvenation.emr',
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

// SecureStore has a ~2KB limit per value on iOS.
// To stay under the limit we store IDs in one key and each record in its own key.

async function getItem(key) {
  try {
    return await SecureStore.getItemAsync(key, OPTIONS);
  } catch (e) {
    console.error('SecureStore read error:', e);
    return null;
  }
}

async function setItem(key, value) {
  try {
    await SecureStore.setItemAsync(key, value, OPTIONS);
  } catch (e) {
    console.error('SecureStore write error:', e);
    throw e;
  }
}

async function removeItem(key) {
  try {
    await SecureStore.deleteItemAsync(key, OPTIONS);
  } catch (e) {
    console.error('SecureStore delete error:', e);
    throw e;
  }
}

async function getStringArray(key) {
  const raw = await getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function setStringArray(key, arr) {
  await setItem(key, JSON.stringify(arr));
}

// -------------------- Patients --------------------
// Same fallback pattern as incidents: SecureStore preferred, AsyncStorage backup.

async function getPatientIds() {
  let ids = await getStringArray(KEYS.PATIENT_IDS);
  if (ids.length === 0) {
    try {
      const fallback = await AsyncStorage.getItem(FALLBACK_KEYS.PATIENT_IDS);
      if (fallback) ids = JSON.parse(fallback);
    } catch (e) {
      console.warn('Fallback patient IDs read failed:', e.message);
    }
  }
  return ids;
}

async function setPatientIds(ids) {
  try {
    await setStringArray(KEYS.PATIENT_IDS, ids);
  } catch (e) {
    console.warn('SecureStore patient IDs write failed, falling back to AsyncStorage:', e.message);
  }
  try {
    await AsyncStorage.setItem(FALLBACK_KEYS.PATIENT_IDS, JSON.stringify(ids));
  } catch (e) {
    console.error('AsyncStorage patient IDs write failed:', e);
    throw e;
  }
}

async function getPatientItem(id) {
  let raw = await getItem(`${KEYS.PATIENT_IDS}:${id}`);
  if (!raw) {
    try {
      raw = await AsyncStorage.getItem(`${ASYNC_KEYS.PATIENT_PREFIX}${id}`);
    } catch (e) {
      console.warn('Fallback patient read failed:', e.message);
    }
  }
  return raw;
}

async function setPatientItem(id, value) {
  try {
    await setItem(`${KEYS.PATIENT_IDS}:${id}`, value);
  } catch (e) {
    console.warn('SecureStore patient write failed, falling back to AsyncStorage:', e.message);
  }
  try {
    await AsyncStorage.setItem(`${ASYNC_KEYS.PATIENT_PREFIX}${id}`, value);
  } catch (e) {
    console.error('AsyncStorage patient write failed:', e);
    throw e;
  }
}

async function removePatientItem(id) {
  try {
    await removeItem(`${KEYS.PATIENT_IDS}:${id}`);
  } catch (e) {
    console.warn('SecureStore patient delete failed:', e.message);
  }
  try {
    await AsyncStorage.removeItem(`${ASYNC_KEYS.PATIENT_PREFIX}${id}`);
  } catch (e) {
    console.error('AsyncStorage patient delete failed:', e);
  }
}

export async function getPatients() {
  const ids = await getPatientIds();
  const patients = [];
  for (const id of ids) {
    const raw = await getPatientItem(id);
    if (raw) {
      try {
        patients.push(JSON.parse(raw));
      } catch {
        // ignore corrupted record
      }
    }
  }
  return patients;
}

export async function savePatient(patient) {
  const ids = await getPatientIds();
  const existingIndex = ids.indexOf(patient.id);
  if (existingIndex < 0) {
    ids.push(patient.id);
    await setPatientIds(ids);
  }
  await setPatientItem(
    patient.id,
    JSON.stringify({ ...patient, updatedAt: Date.now() })
  );
  return getPatients();
}

export async function deletePatient(id) {
  const ids = await getPatientIds();
  const filtered = ids.filter((pId) => pId !== id);
  await setPatientIds(filtered);
  await removePatientItem(id);
  return getPatients();
}

// -------------------- Incidents --------------------
// SecureStore is the preferred encrypted store, but some Android devices fail
// on large values or keystore access. We fall back to AsyncStorage for metadata
// so the incident log never silently loses entries. Media files remain in the
// app-private FileSystem.documentDirectory.

async function getIncidentIds() {
  let ids = await getStringArray(KEYS.INCIDENT_IDS);
  if (ids.length === 0) {
    try {
      const fallback = await AsyncStorage.getItem(FALLBACK_KEYS.INCIDENT_IDS);
      if (fallback) ids = JSON.parse(fallback);
    } catch (e) {
      console.warn('Fallback incident IDs read failed:', e.message);
    }
  }
  return ids;
}

async function setIncidentIds(ids) {
  try {
    await setStringArray(KEYS.INCIDENT_IDS, ids);
  } catch (e) {
    console.warn('SecureStore incident IDs write failed, falling back to AsyncStorage:', e.message);
  }
  try {
    await AsyncStorage.setItem(FALLBACK_KEYS.INCIDENT_IDS, JSON.stringify(ids));
  } catch (e) {
    console.error('AsyncStorage incident IDs write failed:', e);
    throw e;
  }
}

async function getIncidentItem(id) {
  let raw = await getItem(`${KEYS.INCIDENT_IDS}:${id}`);
  if (!raw) {
    try {
      raw = await AsyncStorage.getItem(`${ASYNC_KEYS.INCIDENT_PREFIX}${id}`);
    } catch (e) {
      console.warn('Fallback incident read failed:', e.message);
    }
  }
  return raw;
}

async function setIncidentItem(id, value) {
  try {
    await setItem(`${KEYS.INCIDENT_IDS}:${id}`, value);
  } catch (e) {
    console.warn('SecureStore incident write failed, falling back to AsyncStorage:', e.message);
  }
  try {
    await AsyncStorage.setItem(`${ASYNC_KEYS.INCIDENT_PREFIX}${id}`, value);
  } catch (e) {
    console.error('AsyncStorage incident write failed:', e);
    throw e;
  }
}

async function removeIncidentItem(id) {
  try {
    await removeItem(`${KEYS.INCIDENT_IDS}:${id}`);
  } catch (e) {
    console.warn('SecureStore incident delete failed:', e.message);
  }
  try {
    await AsyncStorage.removeItem(`${ASYNC_KEYS.INCIDENT_PREFIX}${id}`);
  } catch (e) {
    console.error('AsyncStorage incident delete failed:', e);
  }
}

export async function getIncidents() {
  const ids = await getIncidentIds();
  const incidents = [];
  for (const id of ids) {
    const raw = await getIncidentItem(id);
    if (raw) {
      try {
        incidents.push(JSON.parse(raw));
      } catch {
        // ignore corrupted record
      }
    }
  }
  return incidents;
}

export async function saveIncident(incident) {
  const ids = await getIncidentIds();
  const existingIndex = ids.indexOf(incident.id);
  if (existingIndex < 0) {
    ids.push(incident.id);
    await setIncidentIds(ids);
  }
  await setIncidentItem(
    incident.id,
    JSON.stringify({ ...incident, updatedAt: Date.now() })
  );
  return getIncidents();
}

export async function deleteIncident(id) {
  const ids = await getIncidentIds();
  const filtered = ids.filter((iId) => iId !== id);
  await setIncidentIds(filtered);
  await removeIncidentItem(id);
  await removeItem(`${KEYS.CHECKLIST_PREFIX}${id}`);
  return getIncidents();
}

// -------------------- Checklist State --------------------

export async function getChecklistState(incidentId) {
  const raw = await getItem(`${KEYS.CHECKLIST_PREFIX}${incidentId}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveChecklistState(incidentId, state) {
  await setItem(
    `${KEYS.CHECKLIST_PREFIX}${incidentId}`,
    JSON.stringify(state)
  );
}

// -------------------- Disclaimer --------------------
// Disclaimer acceptance is not PHI. We try SecureStore first for consistency,
// but fall back to AsyncStorage on Android devices where SecureStore hangs/fails.

const ASYNC_DISCLAIMER_KEY = '@emr_disclaimer_accepted';

export async function hasAcceptedDisclaimer() {
  try {
    const value = await getItem(KEYS.DISCLAIMER_ACCEPTED);
    if (value === 'true') return true;
  } catch (e) {
    console.warn('SecureStore disclaimer read failed, trying AsyncStorage:', e.message);
  }

  try {
    const value = await AsyncStorage.getItem(ASYNC_DISCLAIMER_KEY);
    return value === 'true';
  } catch (e) {
    console.error('AsyncStorage disclaimer read failed:', e);
    return false;
  }
}

export async function setDisclaimerAccepted(accepted) {
  const value = accepted ? 'true' : 'false';
  try {
    await setItem(KEYS.DISCLAIMER_ACCEPTED, value);
  } catch (e) {
    console.warn('SecureStore disclaimer write failed, falling back to AsyncStorage:', e.message);
  }

  try {
    await AsyncStorage.setItem(ASYNC_DISCLAIMER_KEY, value);
  } catch (e) {
    console.error('AsyncStorage disclaimer write failed:', e);
    throw e;
  }
}

// -------------------- PIN --------------------

function getPinKey(salt) {
  return `${KEYS.PIN_HASH}:${salt}`;
}

export async function hasSetPin() {
  const salt = await getItem(KEYS.PIN_SALT);
  return !!salt;
}

export async function setPin(pin) {
  const salt = await Crypto.getRandomBytesAsync(16);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${pin}:${saltHex}`
  );
  await setItem(KEYS.PIN_SALT, saltHex);
  await setItem(getPinKey(saltHex), hash);
}

export async function validatePin(pin) {
  const saltHex = await getItem(KEYS.PIN_SALT);
  if (!saltHex) return false;
  const storedHash = await getItem(getPinKey(saltHex));
  if (!storedHash) return false;
  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${pin}:${saltHex}`
  );
  return inputHash === storedHash;
}

// -------------------- Premium Unlock Codes --------------------

export async function isContentUnlocked() {
  const code = await getItem(KEYS.UNLOCK_CODE);
  return VALID_UNLOCK_CODES.includes(code);
}

export async function getStoredUnlockCode() {
  return await getItem(KEYS.UNLOCK_CODE);
}

export async function validateUnlockCode(code) {
  const normalized = code?.trim().toUpperCase();
  if (VALID_UNLOCK_CODES.includes(normalized)) {
    await setItem(KEYS.UNLOCK_CODE, normalized);
    return true;
  }
  return false;
}

export async function clearUnlockCode() {
  await removeItem(KEYS.UNLOCK_CODE);
}

// -------------------- Migration / Clear --------------------

export async function clearAll() {
  const patientIds = await getStringArray(KEYS.PATIENT_IDS);
  for (const id of patientIds) {
    await removeItem(`${KEYS.PATIENT_IDS}:${id}`);
  }
  await removeItem(KEYS.PATIENT_IDS);

  const incidentIds = await getStringArray(KEYS.INCIDENT_IDS);
  for (const id of incidentIds) {
    await removeItem(`${KEYS.INCIDENT_IDS}:${id}`);
    await removeItem(`${KEYS.CHECKLIST_PREFIX}${id}`);
  }
  await removeItem(KEYS.INCIDENT_IDS);

  await removeItem(KEYS.DISCLAIMER_ACCEPTED);
  await removeItem(KEYS.PIN_SALT);
}
