# Danger Zone Atlas — Manual Test Script

Run these on a real Android device or iOS device after installing the preview APK.

## Prerequisites
- Device in airplane mode (verifies offline-first requirement).
- App freshly installed or disclaimer already accepted.

## Test Cases

1. **Open the app and reach Home.** Confirm you see the `Danger Zones` tool button.

2. **Tap Danger Zones.** The Atlas screen opens; the app does not close or hang.

3. **Frontal map renders.** You see a face outline with labeled zones (Glabella, Nose, Temple, etc.).

4. **Tap Glabella zone.** A detail sheet opens with `Critical Risk`, parent vessel, anastomoses, warning signs, and actions.

5. **Open Vascular Occlusion from sheet.** The `Open Vascular Occlusion Protocol` button navigates to the VO protocol.

6. **Return and open calculator.** Re-open the Atlas, tap a zone, and tap `Hyaluronidase Calculator` to reach the Calculator screen.

7. **Toggle Lateral view.** Tap `Lateral`; the map redraws as a profile view. Tap zones and confirm sheets open.

8. **Search the list.** Type `nasolabial` or `temple` in the search box; only matching zones remain.

9. **Pinch and pan.** Pinch to zoom the map, drag to pan, double-tap to reset.

10. **Simulate map failure.** If possible, force a crash in the map component (e.g., corrupt a path string in a test build). The screen should show the fallback message and the searchable list should still work.

## Expected Results
- No crashes from any path in this script.
- Every tappable zone has an accessibility label readable by screen reader.
- Footer shows `Clinical content reviewed to 2026-09-20. Educational reference only.`
