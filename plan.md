QR Code Toolkit — Expo App Development Plan

1. Product Overview

Build a clean, modern Android-first QR Code Toolkit using Expo + React Native + NativeWind.

The app should provide:

- QR code scanner
- QR code generator
- Scan/generation history
- Copy scanned/generated content
- Share QR/content
- Delete history
- Offline-first experience

The app should feel like a polished small utility app rather than a demo project.

⸻

2. Tech Stack

Use:

- Expo
- React Native
- TypeScript
- NativeWind
- Expo Router
- Expo Camera / barcode scanning
- AsyncStorage or SQLite for local persistence
- Expo Clipboard
- Expo Sharing
- react-native-svg if needed for QR rendering
- A reliable QR generation library compatible with Expo

Do not introduce unnecessary backend infrastructure.

The application should work completely offline except for anything that is genuinely required by the QR library.

⸻

3. Visual Design

Theme

Primary visual direction:

Orange + Black + Pastel

The design should be:

- Minimal
- Friendly
- Modern
- Slightly playful
- High contrast
- Rounded
- Spacious
- Mobile-first

Avoid making it look like a corporate enterprise application.

Suggested palette

Use these as the initial design tokens:

Primary Orange: #FF8A3D
Light Orange: #FFD8BD
Pastel Orange: #FFEBDD
Black: #171717
Dark Gray: #2A2A2A
Gray: #737373
Background: #FFF9F5
White: #FFFFFF
Pastel Green: #DDF5E5
Pastel Blue: #DDEEFF
Pastel Purple: #E9DFFF
Pastel Yellow: #FFF1B8
Danger: #FF6B6B

Use orange primarily for:

- Primary buttons
- Active navigation
- Important icons
- Highlights
- QR scan action
- Selected states

Use black/dark gray for primary text.

Use pastel colors for cards, categories, empty states, and secondary visual elements.

Do not use excessive gradients.

⸻

4. Navigation

Use Expo Router.

Bottom tab navigation:

Home
Scan
Generate
History

Home

Dashboard showing:

- App name/logo
- Short greeting/title
- Large “Scan QR” button
- “Generate QR” button
- Recent history
- Quick actions

Example structure:

QR Toolkit
Scan or create QR codes
quickly and privately.
[ Scan QR ]
[ Generate QR ]
Recent
----------------

Website
https://example.com
WiFi
MyNetwork
Text
Hello World

⸻

5. Scan QR

The Scan screen should open the camera.

UI:

< Back
Scan QR Code
Place the QR code inside
the frame
┌──────────┐
│ │
│ QR │
│ │
└──────────┘
[ Flash ]
Scan result appears after detection

Requirements:

- Request camera permission properly.
- Handle permission denied state.
- Allow flashlight toggle if supported.
- Detect QR codes.
- Prevent duplicate scans while processing.
- After successful scan, show a result screen/modal.
- Save scan automatically to history.
- Allow user to scan another QR.
- Provide haptic feedback on successful scan if appropriate.

⸻

6. Scan Result

Show:

QR Code
Website
https://example.com
[ Copy ]
[ Share ]
[ Open ]
[ Scan Again ]

Detect common QR content types where practical:

- URL
- Plain text
- Email
- Phone
- WiFi
- SMS

Do not over-engineer parsing.

If content isn’t recognized:

Text
<raw content>

For URLs, provide an “Open” action.

Always provide:

- Copy
- Share
- Delete from history

⸻

7. Generate QR

The Generate screen should allow users to select a content type.

Initial types:

Text
URL
WiFi
Email
Phone

Use a simple card/grid:

Generate QR
What do you want to create?
[ Text ] [ URL ]
[ WiFi ] [ Email ]
[ Phone ]

⸻

8. Generate Form

Text

Text
[ Enter text... ]
[ Generate QR ]

URL

Website URL
[ https://example.com ]
[ Generate QR ]

WiFi

Fields:

Network name
Password
Security
WPA/WPA2
WEP
None
Hidden network
[ Generate QR ]

Email

Fields:

Email
Subject
Message
[ Generate QR ]

Phone

Phone number
[ Generate QR ]

Validate input where appropriate.

⸻

9. Generated QR Screen

Display a large QR code centered on the screen.

Example:

Your QR Code
┌─────────────────┐
│ │
│ QR │
│ │
└─────────────────┘
Website
https://example.com
[ Save ]
[ Share ]
[ Copy Content ]
[ Create Another ]

The QR should be large enough to scan easily.

Keep the generated QR visually clean.

⸻

10. QR Customization

Keep V1 simple.

Allow:

- Orange QR
- Black QR
- White/background
- Rounded container

Do NOT add complicated QR styling in V1.

Potential V2 features:

- Logo
- Custom colors
- QR templates
- Export PNG
- Export SVG

⸻

11. History

History should contain both scans and generated QR codes.

Example:

History
[ All ] [ Scanned ] [ Generated ]
Today
🌐 Website
example.com
8:42 PM
▣ WiFi
Home WiFi
7:10 PM
T Text
Hello World
5:32 PM

Each item should show:

- Type
- Short preview
- Date/time
- Scanned/generated indicator

Tap an item to open its detail screen.

⸻

12. History Actions

Each history item should support:

- Open
- Copy
- Share
- Delete

Allow:

Delete
Delete all history

Add confirmation before deleting all history.

History must persist after the app is closed.

⸻

13. Empty States

Don’t show blank screens.

Example:

No QR codes yet
Scan or generate your first
QR code and it will appear here.
[ Scan QR ]

Use a small friendly illustration/icon if appropriate.

Keep illustrations simple.

⸻

14. Components

Create reusable components instead of putting everything inside screens.

Suggested structure:

components/
Button.tsx
IconButton.tsx
QRCard.tsx
HistoryItem.tsx
EmptyState.tsx
TypeBadge.tsx
ScreenHeader.tsx
Input.tsx
SegmentedControl.tsx
BottomSheet.tsx

Use NativeWind classes consistently.

Avoid large amounts of inline styles.

⸻

15. Data Model

Use a simple local model.

Example:

type QRHistoryItem = {
id: string;
type: 'text' | 'url' | 'wifi' | 'email' | 'phone';
content: string;
title?: string;
mode: 'scanned' | 'generated';
createdAt: string;
};

For WiFi/email data, store enough information to regenerate the QR.

Do not store unnecessary user information.

⸻

16. State Management

Do not introduce Redux unless the application actually needs it.

Prefer:

- React state
- Context where necessary
- Local persistence layer

Keep architecture simple.

Create a small repository/service for history:

services/
history.ts

Functions:

getHistory()
addHistoryItem()
deleteHistoryItem()
clearHistory()

⸻

17. Permissions

Handle permissions gracefully.

Camera permission states:

Request permission
↓
Granted → Scanner
↓
Denied → Permission explanation
↓
Open Settings

Never leave the user on a blank camera screen.

⸻

18. UX Requirements

The app should feel fast.

Important:

- No unnecessary loading screens.
- Scanner opens quickly.
- Generated QR appears immediately.
- Copy action gives feedback.
- Share action works through native Android share sheet.
- Successful scan gives haptic/visual feedback.
- Destructive actions require confirmation.
- Keyboard should behave correctly with forms.

Use toast/snackbar feedback for actions such as:

Copied to clipboard
Saved to history
Deleted

⸻

19. Android Focus

V1 should prioritize Android.

Check:

- Android navigation behavior
- Back button behavior
- Camera permission flow
- Status bar
- Safe areas
- Keyboard handling
- Share sheet
- Clipboard
- Different screen sizes

The app should still remain compatible with iOS where Expo supports the required APIs, but Android UX is the priority.

⸻

20. Accessibility

Include:

- Accessible labels for icon-only buttons
- Sufficient text contrast
- Reasonable touch targets
- Screen-reader-friendly controls
- Don’t communicate information through color alone

⸻

21. Code Quality

Follow these rules:

- TypeScript strict where practical.
- Avoid any.
- Reuse components.
- Keep screens relatively small.
- Separate UI from persistence/business logic.
- No unnecessary dependencies.
- No hardcoded duplicated colors throughout the application.
- Create a central theme/design-token approach.
- Use NativeWind for styling.

Before adding a dependency, check whether Expo/React Native already provides the required functionality.

⸻

22. Suggested Project Structure

app/
_layout.tsx
index.tsx
scan/
index.tsx
result.tsx
generate/
index.tsx
text.tsx
url.tsx
wifi.tsx
email.tsx
phone.tsx
result.tsx
history/
index.tsx
[id].tsx
components/
Button.tsx
QRCard.tsx
HistoryItem.tsx
EmptyState.tsx
Input.tsx
ScreenHeader.tsx
services/
history.ts
qr.ts
hooks/
useHistory.ts
constants/
theme.ts
types/
qr.ts
assets/

Adjust the structure if Expo Router conventions or the existing project architecture suggest a better organization.

⸻

23. Development Phases

Phase 1 — Foundation

Implement:

- Expo project
- TypeScript
- NativeWind
- Expo Router
- Theme
- Bottom navigation
- Basic reusable components

Goal:

All major screens can be navigated.

⸻

Phase 2 — QR Scanner

Implement:

- Camera permission
- QR scanner
- Flashlight
- Detection
- Scan result
- Copy
- Share
- Open URL
- Save history

Goal:

A user can scan a QR and interact with the result.

⸻

Phase 3 — QR Generator

Implement:

- Text
- URL
- WiFi
- Email
- Phone
- QR preview
- Copy
- Share
- Save history

Goal:

A user can generate useful QR codes.

⸻

Phase 4 — History

Implement:

- Persistent storage
- History list
- Filters
- Detail screen
- Delete
- Clear all
- Reuse/regenerate QR

Goal:

History survives app restarts.

⸻

Phase 5 — Polish

Improve:

- Animations
- Haptic feedback
- Empty states
- Error states
- Loading states
- Keyboard handling
- Android back behavior
- Accessibility
- UI consistency

⸻

24. V1 Definition of Done

The application is complete when a user can:

1. Open the app.
2. Scan a QR code.
3. See the decoded result.
4. Copy the result.
5. Share the result.
6. Open a URL result.
7. See the scan in history.
8. Generate a text QR.
9. Generate a URL QR.
10. Generate a WiFi QR.
11. Generate an email QR.
12. Generate a phone QR.
13. Share a generated QR.
14. Copy generated content.
15. See generated QR codes in history.
16. Delete individual history items.
17. Clear all history.
18. Restart the app and still have history.
19. Use the app without an account or backend.
20. Use the app offline.

⸻

25. Important Scope Rule

Do not over-engineer V1.

Do NOT add:

- Login
- Backend
- Cloud sync
- User accounts
- Analytics dashboard
- AI features
- Payments
- Complex QR customization
- Social features

The goal is a small, polished utility app that can realistically be finished and published.

Prioritize:

Fast → Simple → Beautiful → Reliable

The orange/black pastel visual identity should be consistent across the entire application.
