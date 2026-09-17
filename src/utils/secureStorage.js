import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEYS = {
  PATIENT_IDS: '@emr_secure_patient_ids',
  INCIDENT_IDS: '@emr_secure_incident_ids',
  CHECKLIST_PREFIX: '@emr_secure_checklist:',
  DISCLAIMER_ACCEPTED: '@emr_secure_disclaimer_accepted',
  PIN_HASH: '@emr_secure_pin_hash',
  PIN_SALT: '@emr_secure_pin_salt',
  UNLOCK_CODE: '@emr_secure_unlock_code',
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

export async function getPatients() {
  const ids = await getStringArray(KEYS.PATIENT_IDS);
  const patients = [];
  for (const id of ids) {
    const raw = await getItem(`${KEYS.PATIENT_IDS}:${id}`);
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
  const ids = await getStringArray(KEYS.PATIENT_IDS);
  const existingIndex = ids.indexOf(patient.id);
  if (existingIndex < 0) {
    ids.push(patient.id);
    await setStringArray(KEYS.PATIENT_IDS, ids);
  }
  await setItem(
    `${KEYS.PATIENT_IDS}:${patient.id}`,
    JSON.stringify({ ...patient, updatedAt: Date.now() })
  );
  return getPatients();
}

export async function deletePatient(id) {
  const ids = await getStringArray(KEYS.PATIENT_IDS);
  const filtered = ids.filter((pId) => pId !== id);
  await setStringArray(KEYS.PATIENT_IDS, filtered);
  await removeItem(`${KEYS.PATIENT_IDS}:${id}`);
  return getPatients();
}

// -------------------- Incidents --------------------

export async function getIncidents() {
  const ids = await getStringArray(KEYS.INCIDENT_IDS);
  const incidents = [];
  for (const id of ids) {
    const raw = await getItem(`${KEYS.INCIDENT_IDS}:${id}`);
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
  const ids = await getStringArray(KEYS.INCIDENT_IDS);
  const existingIndex = ids.indexOf(incident.id);
  if (existingIndex < 0) {
    ids.push(incident.id);
    await setStringArray(KEYS.INCIDENT_IDS, ids);
  }
  await setItem(
    `${KEYS.INCIDENT_IDS}:${incident.id}`,
    JSON.stringify({ ...incident, updatedAt: Date.now() })
  );
  return getIncidents();
}

export async function deleteIncident(id) {
  const ids = await getStringArray(KEYS.INCIDENT_IDS);
  const filtered = ids.filter((iId) => iId !== id);
  await setStringArray(KEYS.INCIDENT_IDS, filtered);
  await removeItem(`${KEYS.INCIDENT_IDS}:${id}`);
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

export async function hasAcceptedDisclaimer() {
  const value = await getItem(KEYS.DISCLAIMER_ACCEPTED);
  return value === 'true';
}

export async function setDisclaimerAccepted(accepted) {
  await setItem(KEYS.DISCLAIMER_ACCEPTED, accepted ? 'true' : 'false');
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
