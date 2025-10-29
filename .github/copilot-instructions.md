# GitHub Copilot Instructions

## Project Overview
This is an **Expo React Native** project for a mobile healthcare tracking app.
The app monitors children's health data in real-time (temperature, humidity, state, and alerts when crying).

The project uses:
- **Expo** with **expo-router** (file-based routing)
- **TypeScript**
- **Context API / Zustand** for state management
- **Axios / WebSocket** for server communication
- **expo-av** for audio playback
- **Expo Haptics** for vibration/haptic feedback

Follow the structure and conventions below when generating or modifying code.

---

## Project Structure
This project uses **expo-router** file-based routing. Structure follows Expo conventions:

```
app/                        # Expo Router screens (file-based routing)
  _layout.tsx              # Root layout with Stack navigation
  (tabs)/                  # Tab group
    _layout.tsx            # Tab navigation layout
    index.tsx              # Home/Dashboard screen (health monitoring)
    profile.tsx            # Profile/Settings screen
  health-detail.tsx        # Health detail screen
  login.tsx                # Login screen
  +not-found.tsx           # 404 screen

components/                # Reusable UI components
  ui/                      # Atomic UI elements
    Button.tsx
    Card.tsx
    IconSymbol.tsx
    TextLabel.tsx
  health/                  # Health-specific components
    HealthMetricCard.tsx
    TemperatureIndicator.tsx
    HumidityIndicator.tsx
  modals/                  # Modal components
    AlertModal.tsx
    CryingAlertModal.tsx
  ThemedText.tsx
  ThemedView.tsx

hooks/                     # Custom React hooks
  useHealthData.ts
  useRealtime.ts
  useColorScheme.ts
  useThemeColor.ts

context/                   # Global state management
  HealthContext.tsx
  AuthContext.tsx

services/                  # Business logic layer
  healthService.ts
  authService.ts

api/                       # API clients
  healthApi.ts
  socketClient.ts

utils/                     # Utility functions
  formatData.ts
  constants.ts
  validators.ts

constants/                 # App constants
  Colors.ts                # Theme colors
  Config.ts                # API URLs, environment configs

assets/                    # Static assets
  sounds/
    alarm.mp3
  images/
    baby.png
  fonts/

types/                     # TypeScript type definitions
  health.types.ts
  api.types.ts
```

---

## Coding Conventions

### 🔤 General
- Always use **TypeScript** (`.ts` / `.tsx`).
- Use **functional components** only.
- Prefer **React Hooks** for logic.
- Use `StyleSheet.create` or theme from `constants/Colors.ts`.
- Keep files focused and modular (single responsibility).

### 🧩 Components
- Components in ui are pure, stateless, reusable.
- Screen logic goes in app routes, not in UI components.
- Always define **Props interfaces** with TypeScript.

### 📱 Screens (Expo Router)
- Use file-based routing in app folder.
- Screen components export default function.
- Use `useLocalSearchParams()` for route params.
- Use `router.push()` / `router.back()` for navigation.

### ⚙️ Data Flow
- `api/` → API/WebSocket connection layer
- `services/` → Business logic (data processing, validation)
- `context/` → Global state providers (health data, auth)
- app screens → Consume context and render UI

### 🌐 Networking
- Use **Axios** for HTTP requests.
- Use **WebSocket** for real-time updates.
- API base URL stored in `constants/Config.ts` or `.env`.
- WebSocket logic in `api/socketClient.ts`.

### 🔔 Realtime Alerts
When receiving "crying" event from server:
1. Show `CryingAlertModal` with red status
2. Play sound using `expo-av`: `Audio.Sound.createAsync(require('@/assets/sounds/alarm.mp3'))`
3. Trigger vibration using `expo-haptics`: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`
4. Vibrate for 2 seconds

---

## Import Path Aliases
Use `@/` prefix for absolute imports (configured in tsconfig.json):

```typescript
import { ThemedText } from '@/components/ThemedText';
import { useHealthData } from '@/hooks/useHealthData';
import { API_BASE_URL } from '@/constants/Config';
```

---

## Output Format for Copilot
When generating code, follow this format:

**File: index.tsx**
````tsx
import { ThemedView } from '@/components/ThemedView';
// your code here
````

**File: `api/socketClient.ts`**
````ts
import io from 'socket.io-client';
// your code here
````

If multiple files, list them separately. No extra explanations unless asked.

---

## Naming Conventions
- **Files**: `kebab-case.tsx` or `PascalCase.tsx` for components
- **Components**: `PascalCase`
- **Hooks**: `useSomething`
- **Context**: `SomethingContext`
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`

---

## Expo Router Navigation
```typescript
import { router } from 'expo-router';

// Navigate
router.push('/health-detail');
router.push({ pathname: '/health-detail', params: { id: '123' } });

// Go back
router.back();

// Replace
router.replace('/login');
```

---

## Theme & Styling
- Use `useColorScheme()` from `@/hooks/useColorScheme` for dark/light mode.
- Colors defined in `constants/Colors.ts`.
- Use `ThemedText` and `ThemedView` for automatic theme adaptation.

```typescript
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const colorScheme = useColorScheme();
const backgroundColor = Colors[colorScheme ?? 'light'].background;
```

---

## Environment Variables
Use `.env` file with `expo-constants`:

```env
API_BASE_URL=https://api.example.com
WS_URL=wss://api.example.com/socket
```

Access via:
```typescript
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

---

## Commit Guidelines
```
feat: add realtime health monitoring with WebSocket
fix: correct temperature display formatting
refactor: move alert logic to useRealtime hook
chore: update dependencies
```

---

## Additional Notes
- Keep code **clean**, **typed**, and **self-documenting**.
- Use **absolute imports** with `@/` prefix.
- Define constants in `constants/Config.ts` or `utils/constants.ts`.
- For scaling: use feature-based folders like `features/health/`, `features/auth/`.
- All network URLs in environment variables.
- Test on iOS and Android using Expo Go or dev builds.