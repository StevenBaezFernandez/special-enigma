# Virteex Web Portal

## 🎯 Purpose
The **Virteex Web Portal** is the primary **Micro-Frontend Host** for the Virteex ERP system. Built with **Angular** and **Module Federation**, it dynamically loads domain-specific UI libraries (e.g., `Inventory`, `Accounting`) to provide a seamless user experience.

## 🏗 Architecture
- **Shell Application:** Handles authentication, routing, and global layout.
- **Micro-Frontends:** Domain-specific Angular libraries loaded on demand.
- **Shared UI Kit:** Atomic components (`libs/shared/ui`) ensuring consistent design language.
- **State Management:** Uses NgRx/Signals for global state (User, Theme, Notifications).

## 🎨 Theming & Styles
The application uses a strict design system defined in `libs/shared/ui/src/styles/_tokens.scss`.
- **Global Styles:** Reset, Typography, Colors.
- **Component Styles:** Encapsulated SCSS.

## 🛠 Configuration
The application requires the following environment variables (in `src/environments/environment.ts`):

| Variable | Description |
| :--- | :--- |
| `API_URL` | URL of the API Gateway. |
| `AUTH_DOMAIN` | Auth0/Keycloak domain. |
| `CLIENT_ID` | OAuth2 Client ID. |

## 🚀 Running the Application

### Development Server
```bash
npx nx serve virteex-web
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

### Production Build
```bash
npx nx build virteex-web --configuration production
```
The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Unit Tests
```bash
npx nx test virteex-web
```

### End-to-End Tests
```bash
npx nx e2e virteex-web-e2e
```

## ⚠️ Notes
- Ensure the API Gateway is running on the configured `API_URL`.
- This application strictly consumes the GraphQL API; direct database access is prohibited.
