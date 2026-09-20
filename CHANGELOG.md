# Changelog

All notable changes to the CEMS mobile app will be documented in this file.

## [Unreleased]

### Fixed
- **Danger Zone Atlas crash**: replaced invalid lowercase `<text>` SVG elements with uppercase `SvgText` from `react-native-svg`; this was causing a render-time crash when opening the Atlas on Android/iOS.

### Added
- Screen-level `ErrorBoundary` component (`src/components/ErrorBoundary.js`) so the Atlas route can no longer crash the whole app.
- Atlas error fallback (`AtlasErrorFallback`) with a retry button and a searchable list fallback that works even if the map fails to render.
- Data-driven typed danger-zone module (`src/features/dangerZone/data/zones.js`) with citation, reviewer, review date, risk tier, anastomoses, warning signs, and immediate actions.
- New SVG face-map component (`FaceMapSvg`) with frontal and lateral views, tappable zones, 44+ pt invisible hit paths, and accessibility labels.
- Searchable zone list (`ZoneList`) with search by artery name, zone name, or region.
- Zone detail sheet (`ZoneDetailSheet`) with one-tap links to the Vascular Occlusion protocol and the hyaluronidase calculator.
- Home-screen guard for the Danger Zones entry: disables the button and shows an alert if the Atlas data module is unavailable or navigation fails.

### Engineering
- All new clinical content is data-driven and typed via JSDoc (`// @ts-check`); no clinical prose is hard-coded in the view.
- The anatomy graphic is bundled locally as SVG and renders offline.

## [1.0.0] - 2026-09-20

- Initial production release: emergency protocols, calculators, incident log, facility locator, biometric lock, encrypted storage, and store-submission assets.
