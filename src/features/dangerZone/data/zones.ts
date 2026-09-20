/**
 * CEMS — Danger Zone Atlas: approved clinical content
 * ---------------------------------------------------------------------------
 * Status:      APPROVED — 20 Sep 2026
 * Reviewed by: Dr. Amr Ismail, MD
 * Contents:    12 zones, frontal + lateral
 *
 * RULES FOR ANYONE EDITING THIS FILE
 * 1. This module is navigational. It contains NO doses, concentrations or volumes. Dosing lives
 *    in the calculators; treatment sequencing lives in the Vascular Occlusion protocol.
 * 2. Every clinical line must stay traceable to `citation`. Do not add a zone without one.
 * 3. Bump `reviewedOn` for the zone you touch. The in-app footer shows the oldest date in view.
 * 4. `id` values are bound to SVG `data-zone` attributes. Renaming an id silently breaks the map.
 */

import type { DangerZone } from "./dangerZone.types";

/** In-app route names. Align these with the navigator in the repo before wiring. */
export const PROTOCOL_ROUTES = {
  vascularOcclusion: "VascularOcclusion",
} as const;

const REVIEWED_BY = "Dr. Amr Ismail, MD";
const REVIEWED_ON = "2026-09-20";

const CITE = {
  beleznay2015:
    "Beleznay K, Carruthers JDA, Humphrey S, Jones D. Avoiding and treating blindness from fillers: " +
    "a review of the world literature. Dermatol Surg. 2015;41(10):1097–1117.",
  beleznay2019:
    "Beleznay K, Carruthers JDA, Humphrey S, Carruthers A, Jones D. Update on avoiding and treating " +
    "blindness from fillers: a recent review of the world literature. Aesthet Surg J. 2019;39(6):662–674.",
  murray2021:
    "Murray G, Convery C, Walker L, Davies E. Guideline for the management of hyaluronic acid " +
    "filler-induced vascular occlusion. J Clin Aesthet Dermatol. 2021;14(5):E61–E69.",
  urdiales2018:
    "Urdiales-Gálvez F, Delgado NE, Figueiredo V, et al. Treatment of soft tissue filler complications: " +
    "expert consensus recommendations. Aesthetic Plast Surg. 2018;42(2):498–510.",
  cotofana2019:
    "Cotofana S, Lachman N. Arteries of the face and their relevance for minimally invasive facial " +
    "procedures: an anatomical review. Plast Reconstr Surg. 2019;143(2):416–426.",
  signorini2016:
    "Signorini M, Liew S, Sundaram H, et al. Global aesthetics consensus: avoidance and management of " +
    "complications from hyaluronic acid fillers — evidence- and opinion-based review and consensus " +
    "recommendations. Plast Reconstr Surg. 2016;137(6):961e–971e.",
  funt2013:
    "Funt D, Pavicic T. Dermal fillers in aesthetics: an overview of adverse events and treatment " +
    "approaches. Clin Cosmet Investig Dermatol. 2013;6:295–316.",
} as const;

const VO_ROUTE = PROTOCOL_ROUTES.vascularOcclusion;

export const DANGER_ZONES: DangerZone[] = [
  // ---------------------------------------------------------------- critical
  {
    id: "supratrochlear",
    name: "Supratrochlear artery",
    region: "Glabella, central forehead, medial brow",
    parentVessel: "Ophthalmic artery (internal carotid)",
    anastomoses: ["Supraorbital artery", "Dorsal nasal artery", "Ophthalmic artery via retrograde flow"],
    riskTier: "critical",
    whyItMatters:
      "A terminal branch of the ophthalmic artery sitting directly under the glabella — the single " +
      "most-cited site for filler-related visual loss. Because flow in this territory can reverse, " +
      "material injected here can travel retrogradely toward the ophthalmic artery and the retina.",
    warningSigns: [
      "Severe, disproportionate pain during or immediately after glabellar injection",
      "Blanching of the glabella or central forehead",
      "Mottled, dusky or grey-blue discolouration spreading upward from the brow",
      "Any visual change, however brief or partial",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision first, then pain, colour and capillary refill.",
      "If any visual symptom is present, treat as a sight-threatening emergency and escalate now.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation for this patient.",
      "Do not massage material further toward the orbit.",
      "Record the time of onset and photograph the area for the incident log.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["glabella", "frown lines", "central brow"],
    citation: `${CITE.beleznay2015} ${CITE.cotofana2019}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "supraorbital",
    name: "Supraorbital artery",
    region: "Supraorbital rim, upper eyelid, lateral brow",
    parentVessel: "Ophthalmic artery (internal carotid)",
    anastomoses: ["Supratrochlear artery", "Frontal branch of the superficial temporal artery", "Ophthalmic artery via retrograde flow"],
    riskTier: "critical",
    whyItMatters:
      "The second terminal ophthalmic branch, emerging at the supraorbital rim. It shares the " +
      "retrograde pathway to the ophthalmic system, so brow and lateral forehead work carries the " +
      "same visual risk as the glabella — it is simply encountered less often.",
    warningSigns: [
      "Pain along the brow or into the orbit during injection",
      "Blanching or mottling over the supraorbital rim and upper lid",
      "Swelling of the upper eyelid that is disproportionate or rapidly progressive",
      "Any visual change or ptosis",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision and eyelid position before anything else.",
      "Escalate immediately if vision is affected — the transfer destination is ophthalmology.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation.",
      "Keep the patient under direct observation; do not send home to 'watch it'.",
      "Document onset time and photograph for the incident log.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["brow", "upper lid", "forehead", "temple brow"],
    citation: `${CITE.beleznay2015} ${CITE.murray2021}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "angular",
    name: "Angular artery",
    region: "Nasolabial fold, nasal sidewall, medial cheek",
    parentVessel: "Facial artery (external carotid) — terminal continuation",
    anastomoses: ["Dorsal nasal artery (and through it the ophthalmic system)", "Superior labial artery", "Infraorbital artery"],
    riskTier: "critical",
    whyItMatters:
      "The most common route by which filler reaches the ophthalmic circulation. The facial artery " +
      "becomes the angular artery alongside the nose and connects to the ophthalmic system through " +
      "the dorsal nasal artery — one continuous low-resistance path from the nasolabial fold to the retina.",
    warningSigns: [
      "Severe pain in the nasolabial fold or along the side of the nose",
      "Blanching that tracks from the fold toward the inner canthus or nose",
      "Livedoid or dusky change over the nasal sidewall",
      "Any visual symptom — this is the classic territory for it",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision before assessing the skin.",
      "If vision is affected, activate emergency transfer and the Vascular Occlusion protocol in parallel.",
      "Run the hyaluronidase calculation for this patient and follow the protocol sequence.",
      "Do not apply pressure toward the orbit.",
      "Document the time of onset, the exact injected product and volume, and photograph the area.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["NLF", "nasolabial folds", "nose", "smile lines"],
    citation: `${CITE.beleznay2015} ${CITE.cotofana2019} ${CITE.murray2021}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "dorsalNasal",
    name: "Dorsal nasal artery",
    region: "Nasal dorsum, radix, nasal root",
    parentVessel: "Ophthalmic artery (internal carotid)",
    anastomoses: ["Angular artery", "Supratrochlear artery", "Ophthalmic system"],
    riskTier: "critical",
    whyItMatters:
      "The bridge between the external and internal carotid territories on the face. Injection at the " +
      "radix sits essentially on the junction where filler can pass from the facial artery system into " +
      "the ophthalmic system, which is why nasal dorsal and radix work deserves the same respect as " +
      "glabellar work.",
    warningSigns: [
      "Severe pain at the nasal root or along the dorsum",
      "White patch at the radix spreading down the nose",
      "Dusky or bluish discolouration of the nasal skin",
      "Impaired vision, eye pain, or a sudden change in visual field",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision — any change is a sight-threatening emergency; escalate without delay.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation.",
      "Arrange same-day specialist review; do not manage this remotely.",
      "Warm compresses and gentle massage only as directed by the protocol.",
      "Log the incident with timestamps and photographs.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["nose bridge", "radix", "nasal root"],
    citation: `${CITE.cotofana2019} ${CITE.beleznay2019}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "frontalBranch",
    name: "Frontal branch of the superficial temporal artery",
    region: "Temple, lateral brow, temporal fossa",
    parentVessel: "Superficial temporal artery (external carotid)",
    anastomoses: ["Supraorbital artery", "Supratrochlear artery", "Deep temporal arteries"],
    riskTier: "critical",
    whyItMatters:
      "Temple volumising is routine, and this vessel anastomoses freely with the supraorbital and " +
      "supratrochlear arteries — documented cases of visual complications from temple injection follow " +
      "this route. The temple also bleeds enthusiastically, so haematoma and vascular compromise can " +
      "present together.",
    warningSigns: [
      "Deep, severe temporal pain during injection",
      "Blanching or livedoid change over the temple or lateral brow",
      "Rapidly expanding swelling or bruising with disproportionate pain",
      "Any visual symptom, however transient",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision, then skin colour and capillary refill over the temporal region.",
      "Escalate immediately if vision is affected.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation.",
      "Do not massage deeply through a suspected haematoma.",
      "Document with photographs and timestamps, and record the product and volume injected.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["temple", "temporal fossa", "lateral brow"],
    citation: `${CITE.beleznay2019} ${CITE.cotofana2019}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "deepTemporal",
    name: "Deep temporal arteries",
    region: "Temporal fossa, deep to the temporal fascia",
    parentVessel: "Maxillary artery (external carotid)",
    anastomoses: ["Superficial temporal artery", "Frontal branch of the superficial temporal artery"],
    riskTier: "high",
    whyItMatters:
      "These run in the plane behind the temporalis fascia, where deep temple volumising is performed. " +
      "They connect the maxillary and superficial temporal systems, so an occlusion here can present " +
      "as a patchy, inconclusive pattern rather than a classic single-vessel picture.",
    warningSigns: [
      "Deep temporal or jaw-region pain out of proportion to the procedure",
      "Patchy, asymmetric blanching or mottling in the temple",
      "Swelling that continues to increase after the appointment",
      "Any visual change or scalp tenderness",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision and document skin colour over the whole temporal region, not just the puncture site.",
      "Open the Vascular Occlusion protocol if there is any sign of vascular compromise.",
      "Run the hyaluronidase calculation for this patient.",
      "Arrange urgent review the same day rather than a routine follow-up.",
      "Photograph the area against a neutral background for later comparison.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["deep temple", "temporal fossa", "temple volumising"],
    citation: `${CITE.cotofana2019} ${CITE.urdiales2018}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },

  // -------------------------------------------------------------------- high
  {
    id: "infraorbital",
    name: "Infraorbital artery",
    region: "Infraorbital foramen, mid-cheek, tear trough",
    parentVessel: "Maxillary artery (external carotid)",
    anastomoses: ["Angular artery", "Facial artery", "Zygomaticofacial artery"],
    riskTier: "high",
    whyItMatters:
      "Supplies the mid-cheek and tear-trough territory and anastomoses with the angular system, so " +
      "risk is not confined to the foramen. The thin, mobile skin of the lower lid also makes any " +
      "compromise visible early — which is an advantage if it is recognised.",
    warningSigns: [
      "Pain in the infraorbital region or upper cheek",
      "Blanching or a dusky patch under the eye",
      "Rapid swelling or a spreading bruise around the orbit",
      "Visual change, or numbness in the cheek and upper lip",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess vision and check capillary refill over the cheek and lower lid.",
      "Escalate immediately if there is any visual symptom.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation.",
      "Arrange same-day review; do not rely on telephone follow-up.",
      "Document with photographs including a frontal and an oblique view.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["tear trough", "under eye", "mid cheek", "infraorbital"],
    citation: `${CITE.cotofana2019} ${CITE.signorini2016}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "zygomaticofacial",
    name: "Zygomatico-orbital and zygomaticofacial arteries",
    region: "Lateral cheek, malar region",
    parentVessel: "Maxillary artery (external carotid)",
    anastomoses: ["Transverse facial artery", "Infraorbital artery", "Facial artery branches"],
    riskTier: "high",
    whyItMatters:
      "Lateral malar volumising sits across these branches, which link the maxillary and superficial " +
      "temporal systems. A compromise here can look like ordinary post-treatment swelling, so the " +
      "clinical sign to trust is disproportionality, not colour alone.",
    warningSigns: [
      "Pain over the malar region that keeps increasing after the procedure",
      "Asymmetric or patchy blanching across the cheek",
      "Swelling that is unilateral and progressive",
      "Skin that feels cool compared with the opposite cheek",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Compare both cheeks for colour, temperature and capillary refill and document the difference.",
      "Open the Vascular Occlusion protocol if compromise is suspected.",
      "Run the hyaluronidase calculation for this patient.",
      "Arrange review within hours, not days.",
      "Photograph both sides for the incident log.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["cheek", "malar", "cheekbones", "lateral cheek"],
    citation: `${CITE.cotofana2019} ${CITE.funt2013}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "labial",
    name: "Superior and inferior labial arteries",
    region: "Upper lip, lower lip, oral commissure",
    parentVessel: "Facial artery (external carotid)",
    anastomoses: ["Inferior alveolar artery via the mental branch", "Submental artery", "Transverse facial artery"],
    riskTier: "high",
    whyItMatters:
      "Lip augmentation is the highest-volume aesthetic procedure and these vessels have a variable " +
      "course — often submucosal, sometimes deeper within the orbicularis, and asymmetric between " +
      "sides. Lip necrosis and commissural scarring are the recognised outcomes when an occlusion goes " +
      "unrecognised.",
    warningSigns: [
      "Severe lip pain during or after injection",
      "Blanching of a lip segment or the vermilion border",
      "Dusky, blue-grey or mottled change over the lip or commissure",
      "Progressive swelling with pain rather than settling",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess the lip for colour, capillary refill and pain in every segment, including the commissure.",
      "Open the Vascular Occlusion protocol and run the hyaluronidase calculation.",
      "Do not continue the planned treatment — cancel any remaining syringes and say so plainly.",
      "Arrange same-day review and give the patient written post-procedure instructions.",
      "Photograph the lip in a resting and a stretched position.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["lip", "lips", "vermilion", "commissure", "lip filler"],
    citation: `${CITE.urdiales2018} ${CITE.signorini2016}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },

  // ---------------------------------------------------------------- moderate
  {
    id: "mental",
    name: "Mental artery",
    region: "Chin, mentolabial fold",
    parentVessel: "Inferior alveolar artery (maxillary)",
    anastomoses: ["Inferior labial artery", "Submental artery"],
    riskTier: "moderate",
    whyItMatters:
      "Supplies the chin and connects with the labial and submental systems. Chin projection work is " +
      "common and generally forgiving, but it is not risk-free — and because chin filler is often " +
      "performed alongside lip work, an evolving problem here can be mistaken for expected swelling.",
    warningSigns: [
      "Persistent pain in the chin that does not settle",
      "Blanching or mottled skin over the chin pad",
      "A swelling that is firm and increasing, rather than soft and settling",
      "Dusky change near the mentolabial crease",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Check colour, temperature and capillary refill over the chin and lower lip.",
      "Open the Vascular Occlusion protocol if compromise is suspected.",
      "Arrange same-day review if the appearance is not clearly improving.",
      "Photograph and document in the incident log.",
      "Give written follow-up instructions and an out-of-hours contact.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["chin", "mental crease", "chin projection"],
    citation: `${CITE.cotofana2019} ${CITE.urdiales2018}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "submental",
    name: "Submental artery",
    region: "Submental and submandibular region",
    parentVessel: "Facial artery (external carotid)",
    anastomoses: ["Mental artery", "Inferior labial artery", "Contralateral submental artery"],
    riskTier: "moderate",
    whyItMatters:
      "Runs in the submental and submandibular plane reached by deeper techniques. The dominant risks " +
      "here are bleeding and haematoma rather than cutaneous necrosis, and a haematoma in this plane " +
      "can compromise the airway if it expands — which is why the neck is treated differently from the face.",
    warningSigns: [
      "Rapidly expanding swelling under the chin or in the upper neck",
      "Difficulty swallowing, a sensation of pressure in the throat, or voice change",
      "Pain on neck extension or difficulty breathing",
      "Progressive bruising tracking down the neck",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Assess the airway first: breathing, voice, swallowing. If any are affected, call emergency services.",
      "Apply appropriate pressure and cold as per the protocol; do not leave the patient alone.",
      "Open the Vascular Occlusion protocol for the vascular component and document the haematoma separately.",
      "Do not discharge a patient with a rapidly expanding neck swelling.",
      "Photograph and record observations over time in the incident log.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["under chin", "neck", "submental", "jawline"],
    citation: `${CITE.urdiales2018} ${CITE.funt2013}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
  {
    id: "transverseFacial",
    name: "Transverse facial artery",
    region: "Anterior cheek, pre-auricular region",
    parentVessel: "Superficial temporal artery (external carotid)",
    anastomoses: ["Zygomaticofacial artery", "Facial artery branches", "Buccal branches"],
    riskTier: "moderate",
    whyItMatters:
      "Crosses the cheek in front of the ear, where it anastomoses with the facial and zygomatic " +
      "territories. It is rarely the primary culprit, but it is a route by which a cheek vascular " +
      "event can present further from the injection point than expected.",
    warningSigns: [
      "Pain over the cheek or in front of the ear",
      "Blanching or mottling that appears away from the injection site",
      "Swelling that tracks upward toward the temple",
      "Any visual symptom",
    ],
    immediateActions: [
      "Stop injecting immediately.",
      "Map the affected area rather than examining only the puncture site.",
      "Open the Vascular Occlusion protocol if compromise is suspected.",
      "Arrange same-day review if the skin change is not clearly resolving.",
      "Document the distribution of the change with a photograph.",
      "Give written instructions and an out-of-hours contact.",
    ],
    protocolLink: VO_ROUTE,
    aliases: ["transverse facial", "preauricular", "cheek artery"],
    citation: `${CITE.cotofana2019} ${CITE.funt2013}`,
    reviewedBy: REVIEWED_BY,
    reviewedOn: REVIEWED_ON,
  },
];

export const DANGER_ZONES_BY_ID: Record<string, DangerZone> = Object.fromEntries(
  DANGER_ZONES.map((z) => [z.id, z]),
);

export const RISK_TIER_LABEL: Record<DangerZone["riskTier"], string> = {
  critical: "Critical vascular territory",
  high: "High-risk vascular territory",
  moderate: "Treat with care",
};

/**
 * Guard used by the home screen: disables the Atlas entry if the data module
 * is empty or malformed, so a failed feature cannot be tapped into a dead route.
 */
export function isAtlasAvailable(): boolean {
  return (
    Array.isArray(DANGER_ZONES) &&
    DANGER_ZONES.length > 0 &&
    DANGER_ZONES.every(
      (z) => z && typeof z.id === "string" && typeof z.name === "string"
    )
  );
}

/** Returns the oldest review date across all zones for the footer. */
export function oldestReviewDate(): string {
  return DANGER_ZONES.reduce(
    (oldest, zone) => (zone.reviewedOn < oldest ? zone.reviewedOn : oldest),
    DANGER_ZONES[0]?.reviewedOn || ""
  );
}

/** Helper for badges and list rows. */
export function riskLabel(tier: DangerZone["riskTier"]): string {
  return RISK_TIER_LABEL[tier] || tier;
}
