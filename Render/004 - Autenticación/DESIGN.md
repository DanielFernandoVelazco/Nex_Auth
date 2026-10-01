---
name: Developer IAM Engine
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system serves technical architects, DevOps engineers, and security compliance officers who require uncompromising precision, auditability, and speed. The interface balances high-density information architecture with visual serenity, avoiding visual noise while surfacing critical security vectors immediately.

The design movement combines **Minimalist High-Density Utility** with **Precision Engineering Aesthetics**:
- **Information Density:** Tight baselines, structured tabular data, and compact forms that eliminate extraneous whitespace in favor of comprehensive context.
- **Architectural Clarity:** Strict geometric rhythm, crisp linear separations, muted slate framing, and high-visibility status indicators.
- **Developer-Centric Surface:** Key security artifacts (secrets, hashes, tokens, tenant IDs, logs) are elevated using calibrated monospaced treatments, instant click-to-copy triggers, and inline syntax cues.
- **Tactile State Semantics:** Every interactive state—active token, revocable grant, warning threshold, terminal error—possesses dedicated tonal framing that communicates operational health without sensory fatigue.

## Colors

The palette establishes an authoritative, security-conscious hierarchy. Navigation frames and deep utility zones rely on slate/neutral structures, while interactive primaries leverage high-chroma indigo and violet to denote active operations and identity primitives.

### Color Tokens & Semantic Application

- **Primary Interactive (`#4F46E5` / `#6366F1`):** Primary buttons, active tab indicators, selected radio/checkbox toggles, inline focal links, and primary API action calls.
- **Verified & Active State (`#10B981`):** Active tenants, valid certificates, authorized client sessions, passing security checks, and enabled multi-factor authentication.
- **Security Warning & Staging (`#F59E0B`):** Expiring keys, rate-limit thresholds (>80%), rotation recommendations, and staged identity provisions.
- **Danger & Revocation (`#F43F5E`):** Blocked accounts, breached credential alerts, revoked API keys, tenant deletion workflows, and role demotions.
- **Dark Structural Baseline (`#0F172A` / `#020617`):** Primary left-rail navigation, developer code blocks, terminal log viewers, and persistent environment switchers.
- **Content Slate Neutrals:**
  - Canvas Background: `#F8FAFC`
  - Elevated Container Background: `#FFFFFF`
  - Subtle Surface/Header Wash: `#F1F5F9`
  - Hairline Borders & Dividers: `#E2E8F0`
  - Subtle Muted Text / Secondary Labels: `#64748B`
  - Body Text: `#334155`
  - Strong Headings & Key Identifiers: `#0F172A`

## Typography

Typography governs the rhythm and technical integrity of the identity suite. The typographic hierarchy combines **Inter** for administrative UI, metrics, and complex form structures, with **JetBrains Mono** for all operational parameters, cryptographic strings, log entries, and payload structures.

### Typographic Principles

- **Inter (Interface & Data):** Selected for its neutral tone, tall x-height, and legible numeric rendering across tight tables. `label-caps` must always be rendered in uppercase with positive letter spacing (`0.05em`) to define metadata headers and table column titles.
- **JetBrains Mono (Identifiers & Code):** Reserved strictly for Client IDs, Client Secrets, Scopes, JSON web tokens (JWT), IP addresses, HTTP status codes, and security audit logs. Tabular numbers ensure alignment down log trees and tabular columns.

## Layout & Spacing

The layout model optimizes screen real estate for desktop-first administrative tasks while gracefully collapsing for tablet monitoring and emergency mobile credential revocation.

### Structural Framework

- **Canvas Architecture:** Persistent left navigation rail (`260px` fixed desktop width, collapsed to `64px` icon-rail or hidden overlay on tablet/mobile). Main content area uses a fluid grid system with a maximum content container of `1600px` for ultra-wide administrative dashboards.
- **High-Density Spacing Model:** An 8-point base scale with 4-point micro increments. Standard padding inside table rows and data lists relies on `space-sm` (`0.5rem`) vertically and `space-md` (`0.75rem`) horizontally.
- **Adaptive Breakpoints:**
  - **Desktop (`>= 1280px`):** Permanent dark rail navigation, side-by-side configuration panels, split-pane JSON inspectors, and 12-column dynamic layout grids with `gutter-desktop` (`1.5rem`).
  - **Tablet (`768px - 1279px`):** Collapsed navigation rail, single-column configuration flows, and tabbed inspector drawers replacing horizontal split screens.
  - **Mobile (`< 768px`):** Off-canvas slideout navigation, sticky top security alerts, and stacked card rows replacing full-column data grids.

## Elevation & Depth

This system avoids heavy drop shadows in favor of **Tonal Layers**, **Crisp 1px Structural Boundaries**, and **Muted Directional Drop-Downs**.

### Depth Layers

1. **Base Layer (`#0F172A` for Navigation, `#F8FAFC` for Main Body):** The fundamental structural backdrop.
2. **Surface Layer (`#FFFFFF`):** High-density cards, panels, and data tables. Outlined uniformly with `1px solid #E2E8F0`. No shadow is applied in resting state to preserve technical flatness.
3. **Elevated Surface Layer (Hovered Cards, Modals, Flyouts):** Used for configuration popovers, secret revelation drawers, and modal credential creators:
   - Outline: `1px solid #CBD5E1`
   - Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`
4. **Terminal / Code Layer (`#020617`):** Embedded JSON viewers, live log streams, and cURL generation boxes inside cards use an inverted deep slate background with a `1px solid #1E293B` boundary, ensuring code syntax remains distinct from administrative inputs.

## Shapes

The design system maintains a **Soft (`1`)** corner geometry. Small radii create an engineered, utilitarian appearance typical of robust developer tools.

- **Base Controls (`rounded` / `0.25rem`):** Text inputs, inline code blocks, table action triggers, buttons, and segmented control chips.
- **Containers (`rounded-lg` / `0.5rem`):** Administrative cards, metrics banners, dialogue modals, and code preview consoles.
- **Pills (`rounded-full` / `9999px`):** Dedicated exclusively to status pills, environmental badges (`PRODUCTION`, `STAGING`), and HTTP method tags (`POST`, `GET`).

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, border radius `0.25rem`, typography `headline-sm`. Hover: `#4338CA`. Active: `#3730A3`. Focus: `2px solid #6366F1` with `2px` offset.
- **Secondary / Neutral:** Background `#FFFFFF`, text `#334155`, border `1px solid #CBD5E1`. Hover: `#F8FAFC`, border color `#94A3B8`.
- **Destructive:** Background `#FFFFFF`, text `#F43F5E`, border `1px solid #FECDD3`. Hover: Background `#FFF1F2`, border color `#FDA4AF`.
- **Icon / Utility Actions:** Compact `28px x 28px` hit target for copy-to-clipboard, show/hide secrets, and quick context menus.

### Badges & Status Pills
- **Active / Verified:** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`. Includes a `6px` solid `#10B981` leading indicator dot.
- **Warning / Review:** Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`. Leading `#F59E0B` indicator dot.
- **Blocked / Revoked:** Background `#FFF1F2`, text `#9F1239`, border `1px solid #FECDD3`. Leading `#F43F5E` indicator dot.
- **Scope / Metadata Badge:** Background `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`, typography `label-code-sm`.

### Input Fields & Secret Controls
- **Standard Input:** Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`. Padding: `0.5rem 0.75rem`. Focus ring: `1px solid #4F46E5`, outline: `2px solid #E0E7FF`.
- **Cryptographic Credential Box:** Inline container utilizing `label-code-md` on background `#F8FAFC` with masked asterisks (`••••••••••••`), integrated trailing copy icon, and click-to-reveal toggle.

### Lists & Data Tables
- **Header Cells:** Background `#F8FAFC`, text `#64748B`, typography `label-caps`, padding `0.5rem 0.75rem`, border-bottom `1px solid #E2E8F0`.
- **Row Cells:** Background `#FFFFFF`, border-bottom `1px solid #F1F5F9`, padding `0.625rem 0.75rem`. Hover state across row: `#F8FAFC`.
- **Log Stream Rows:** Inverted mode for terminal output (`#020617` background, alternating lines `#0B1120`, font `label-code-sm`, timestamps `#64748B`, payloads `#E2E8F0`).

### Checkboxes & Toggle Switches
- **Toggle Switches (Feature Flags / MFA Toggles):** Track `36px x 20px`, off-state `#CBD5E1`, on-state `#4F46E5`. Thumb: `#FFFFFF` circle `16px`, smooth `150ms` ease-in-out transition.
- **Checkboxes:** Size `16px x 16px`, corner radius `2px`. Checked state: `#4F46E5` with `#FFFFFF` checkmark icon.

### Cards & Configuration Panels
- **Structure:** Background `#FFFFFF`, border `1px solid #E2E8F0`, radius `0.5rem`.
- **Header Section:** Bottom-bordered `1px solid #F1F5F9`, padding `1rem 1.25rem`, displaying title (`headline-md`) alongside tenant metadata and auxiliary action triggers.
- **Footer Section:** Background `#F8FAFC`, top-border `1px solid #E2E8F0`, padding `0.75rem 1.25rem`, right-aligned action buttons.

### Tab Navigation
- **Underline Style:** Used for top-level tenant settings (e.g., Quickstart, Settings, Connections, Permissions). Tab text `#64748B`, active text `#4F46E5`, active underline `2px solid #4F46E5` spanning the width of the label.
- **Pill Switcher (Code Languages / Environments):** Segmented container with `#F1F5F9` background, `#E2E8F0` border, active item `#FFFFFF` with soft inset shadow and `#0F172A` text.