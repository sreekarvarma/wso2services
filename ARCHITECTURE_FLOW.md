# WSO2 Toolkit - Architecture & Flow Diagrams

## Application Creation Flow (CORRECT - Proper APIM Integration)
```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ ./wso2-toolkit.sh create-app MyApp
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│              Toolkit Script (2-Step Flow)               │
└────┬──────────────────────────────────────┬─────────────┘
     │                                      │
     │ STEP 1:                              │ STEP 2:
     │ POST /api/am/devportal/v3/           │ POST /api/am/devportal/v3/
     │      applications                    │      applications/{id}/
     │                                      │      generate-keys
     ▼                                      ▼
┌────────────────────────────────────────────────────────┐
│                   WSO2 API Manager                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DevPortal                                       │  │
│  │  • Creates application record                    │  │
│  │  • Assigns throttling policy                     │  │
│  │  • Enables API subscriptions                     │  │
│  │  • Sets up analytics                             │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                  │
│                      │ DCR (Dynamic Client Registration)│
│                      │ via Key Manager "WSO2IS"         │
│                      ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Key Manager Integration                         │  │
│  │  • Connects to configured Key Manager            │  │
│  │  • Registers OAuth2 client                       │  │
│  │  • Stores credentials                            │  │
│  └───────────────────┬──────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                       │
                       │ DCR: POST /oauth2/dcr/v1.1/register
                       │
                       ▼
              ┌──────────────────┐
              │    WSO2 IS       │
              │  (Key Manager)   │
              │                  │
              │ • Creates OAuth2 │
              │   client         │
              │ • Issues Client  │
              │   ID & Secret    │
              │ • Configures     │
              │   grant types    │
              └────────┬─────────┘
                       │
                       │ Returns: client_id, client_secret
                       │
                       ▼
              ┌──────────────────┐
              │   Toolkit Script │
              │                  │
              │ Displays:        │
              │ • App ID         │
              │ • Client ID      │
              │ • Client Secret  │
              │ • Grant Types    │
              └──────────────────┘

BENEFITS:
✓ Application visible in APIM DevPortal UI
✓ Can subscribe to APIs
✓ Throttling policies applied
✓ Analytics enabled
✓ Proper OAuth2 flow
✓ Key Manager integration automatic
```

## Token Generation Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ ./wso2-toolkit.sh get-token cc <client-id> <secret>
     │
     ▼
┌─────────────────┐
│  Toolkit Script │
└────┬────────────┘
     │
     │ POST /oauth2/token
     │ grant_type=client_credentials
     │ Authorization: Basic <base64(client_id:client_secret)>
     │
     ▼
┌──────────────────────────────────────┐
│            WSO2 IS                    │
│       (OAuth2 Server)                 │
│                                       │
│  1. Validates client credentials     │
│  2. Checks grant type permissions    │
│  3. Generates JWT access token       │
│  4. Signs with private key           │
│                                       │
└────┬──────────────────────────────────┘
     │
     │ Returns: { access_token, expires_in }
     │
     ▼
┌─────────────────┐
│  Toolkit Script │ → Displays token
└────┬────────────┘
     │
     │ Token can be used to call APIM Gateway
     │
     ▼
┌──────────────────────────────────────┐
│         WSO2 APIM Gateway            │
│          (port 8243)                 │
│                                       │
│  1. Receives API request with token  │
│  2. Validates JWT signature (JWKS)   │
│  3. Checks token expiry              │
│  4. Verifies API subscription        │
│  5. Applies throttling policies      │
│  6. Forwards to backend              │
│                                       │
└───────────────────────────────────────┘
```

## Component Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     Docker Environment                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 WSO2 API Manager (wso2am)              │  │
│  │                     localhost:9443                     │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │  Publisher   │  │  DevPortal   │  │   Gateway   │ │  │
│  │  │   Portal     │  │    (NEW!)    │  │  :8243      │ │  │
│  │  └──────────────┘  └──────┬───────┘  └─────────────┘ │  │
│  │                           │                           │  │
│  │                           │ Manages Apps              │  │
│  │                           ▼                           │  │
│  │                  ┌──────────────────┐                 │  │
│  │                  │  Key Manager     │                 │  │
│  │                  │  Integration     │                 │  │
│  │                  └─────────┬────────┘                 │  │
│  └────────────────────────────┼───────────────────────────┘  │
│                               │                              │
│                               │ HTTPS (MTLS)                 │
│                               │                              │
│  ┌────────────────────────────┼───────────────────────────┐  │
│  │                 WSO2 Identity Server (wso2is)         │  │
│  │                     localhost:9444                    │  │
│  │                            │                          │  │
│  │  ┌──────────────┐  ┌───────▼──────┐  ┌────────────┐ │  │
│  │  │    OAuth2    │  │   DCR API    │  │  SCIM2     │ │  │
│  │  │    Server    │  │  (Register   │  │  (Roles)   │ │  │
│  │  │              │  │   Clients)   │  │            │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL (postgres-wso2)               │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ apim_db  │  │identity_db│  │ shared_db/       │   │  │
│  │  │          │  │           │  │ shared_db_is     │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ ./wso2-toolkit.sh
                              │
                        ┌─────┴──────┐
                        │   Host     │
                        │  Machine   │
                        └────────────┘
```

## API Endpoint Mapping

### Old vs New Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION MANAGEMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OLD (INCORRECT):                                          │
│  └─ WSO2 IS Application API                               │
│     └─ https://wso2is:9444/api/server/v1/applications     │
│        ├─ POST /                (create app)               │
│        ├─ GET  /                (list apps)                │
│        ├─ GET  /{id}            (get app)                  │
│        ├─ DELETE /{id}          (delete app)               │
│        └─ GET /{id}/inbound-protocols/oidc (get creds)    │
│                                                             │
│  NEW (CORRECT):                                            │
│  └─ APIM DevPortal API                                     │
│     └─ https://wso2am:9443/api/am/devportal/v3/           │
│        ├─ POST /applications           (create app)        │
│        ├─ POST /applications/{id}/generate-keys (gen keys)│
│        ├─ GET  /applications           (list apps)         │
│        ├─ GET  /applications/{id}      (get app)          │
│        ├─ GET  /applications/{id}/keys/{type} (get keys)  │
│        └─ DELETE /applications/{id}    (delete app)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    KEY MANAGER MANAGEMENT                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  APIM Admin API (No Change - Already Correct)             │
│  └─ https://wso2am:9443/api/am/admin/v4/key-managers      │
│     ├─ POST /                   (add Key Manager)          │
│     ├─ GET  /                   (list Key Managers)        │
│     ├─ GET  /{id}               (get Key Manager)          │
│     ├─ PUT  /{id}               (update Key Manager)       │
│     └─ DELETE /{id}             (delete Key Manager)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ROLE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WSO2 IS SCIM2 API (No Change - Already Correct)          │
│  └─ https://wso2is:9444/scim2/Roles                       │
│     ├─ POST /                   (create role)              │
│     ├─ GET  /                   (list roles)               │
│     ├─ GET  /{id}               (get role)                 │
│     └─ DELETE /{id}             (delete role)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      TOKEN GENERATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WSO2 IS OAuth2 API (No Change - Already Correct)         │
│  └─ https://wso2is:9444/oauth2/                           │
│     ├─ POST /token              (get token)                │
│     ├─ POST /revoke             (revoke token)             │
│     ├─ POST /introspect         (introspect token)         │
│     └─ GET  /jwks               (get JWKS)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Complete Application Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Setup                                              │
└─────────────────────────────────────────────────────────────┘

User → ./wso2-toolkit.sh setup-km
  │
  └─→ APIM Admin API
        │
        └─→ Creates Key Manager "WSO2IS"
              • Registers WSO2 IS endpoints
              • Configures grant types
              • Sets up DCR endpoint


┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Application Creation                               │
└─────────────────────────────────────────────────────────────┘

User → ./wso2-toolkit.sh create-app MyApp http://callback
  │
  ├─→ [STEP 1] APIM DevPortal: Create Application
  │     │
  │     └─→ APIM creates:
  │           • Application record
  │           • Subscription quotas
  │           • Analytics tracking
  │
  └─→ [STEP 2] APIM DevPortal: Generate Keys
        │
        ├─→ APIM → WSO2IS DCR API
        │     │
        │     └─→ WSO2IS creates OAuth2 client
        │           • client_id
        │           • client_secret
        │           • grant_types
        │
        └─→ APIM stores credentials
              │
              └─→ Returns to user:
                    • Application ID
                    • Client ID
                    • Client Secret


┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Token Generation                                   │
└─────────────────────────────────────────────────────────────┘

User → ./wso2-toolkit.sh get-token cc <id> <secret>
  │
  └─→ WSO2IS OAuth2 /token endpoint
        │
        ├─→ Validates client credentials
        ├─→ Checks grant type permissions
        ├─→ Generates JWT access token
        │
        └─→ Returns:
              • access_token (JWT)
              • token_type: "Bearer"
              • expires_in: 3600


┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: API Call                                           │
└─────────────────────────────────────────────────────────────┘

Client → APIM Gateway :8243
  │
  │ Headers:
  │   Authorization: Bearer <access_token>
  │
  └─→ APIM Gateway
        │
        ├─→ Validates JWT signature (using JWKS from WSO2IS)
        ├─→ Checks token expiry
        ├─→ Verifies API subscription exists
        ├─→ Applies throttling policies
        ├─→ Records analytics
        │
        └─→ Proxies to backend API
              │
              └─→ Returns response to client
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  CERTIFICATE TRUST (MTLS)                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐                              ┌──────────────┐
│   WSO2 AM    │◄────────────────────────────►│   WSO2 IS    │
│              │    Mutual TLS (MTLS)         │              │
└──────┬───────┘                              └───────┬──────┘
       │                                              │
       │ client-truststore.jks                        │ client-truststore.jks
       │ ├─ wso2is cert                               │ ├─ wso2am cert
       │ └─ wso2carbon                                │ └─ wso2carbon
       │                                              │
       └──────────────────────────────────────────────┘
                  ./wso2-toolkit.sh fix-mtls

                  1. Export IS cert from keystore
                  2. Import to AM truststore
                  3. Export AM cert from keystore
                  4. Import to IS truststore
                  5. Restart containers


┌─────────────────────────────────────────────────────────────┐
│                    JWT TOKEN VALIDATION                     │
└─────────────────────────────────────────────────────────────┘

1. WSO2 IS signs JWT with private key
2. Publishes public key via JWKS endpoint
3. APIM Gateway fetches JWKS
4. APIM validates JWT signature using public key

Flow:
┌──────────────┐
│   WSO2 IS    │
│              │
│ Signs JWT    │
│ with private │
│ key          │
└──────┬───────┘
       │
       │ JWT: eyJhbGciOiJSUzI1NiIs...
       │
       ▼
┌──────────────┐     GET /oauth2/jwks        ┌──────────────┐
│    Client    │────────────────────────────►│  APIM Gateway│
│              │                             │              │
│              │◄────────────────────────────│ Validates    │
└──────────────┘     Protected Response      │ using JWKS   │
                                             └──────────────┘
```

## Summary

### What Changed
1. **Application Management**: Now uses APIM DevPortal API (not WSO2 IS directly)
2. **Two-Step Flow**: Create app → Generate keys
3. **Proper Integration**: Apps visible in APIM UI with full features

### What Stayed Same
1. **Key Manager Setup**: Still uses APIM Admin API
2. **Role Management**: Still uses WSO2 IS SCIM2 API
3. **Token Generation**: Still uses WSO2 IS OAuth2 API

### Benefits
✓ Applications properly managed by APIM
✓ Full DevPortal integration
✓ API subscription support
✓ Throttling and analytics
✓ Better security and governance
