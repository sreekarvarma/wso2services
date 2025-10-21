# WSO2 Money Transfer App - Complete Setup

Production-ready WSO2 API Manager 4.5.0 + WSO2 Identity Server 7.1.0 with PostgreSQL.

## ✅ What's Configured

- **PostgreSQL** - 4 databases (apim_db, shared_db, identity_db, shared_db_is)
- **WSO2 Identity Server 7.1.0** - External Key Manager
- **WSO2 API Manager 4.5.0** - API Gateway
- **All OAuth 2.0 Grant Types** - Ready to use
- **TOML Configuration** - Fixed and validated
- **Token Revocation** - Configured for external KM

## 🚀 Quick Start (5 Minutes)

### 1. Start Services
```bash
docker compose up -d
```

Wait ~2 minutes, then verify:
```bash
./scripts/wso2-toolkit.sh health
```

### 2. Setup Key Manager (Automated or Manual)

#### Option A: Automated (Recommended - 30 seconds)
```bash
# Setup WSO2IS as Key Manager using well-known endpoint
./scripts/wso2-toolkit.sh setup-km

# Disable Resident Key Manager (after WSO2IS is added)
./scripts/wso2-toolkit.sh disable-resident-km

# Verify MTLS certificate trust
./scripts/wso2-toolkit.sh check-mtls

# Fix MTLS if needed
./scripts/wso2-toolkit.sh fix-mtls

# Verify JWKS for DCR
./scripts/wso2-toolkit.sh check-ssa-jwks
```

#### Option B: Manual (3 min)
**Why manual?** The Admin REST API structure varies by APIM version. Manual setup via UI is officially recommended and 100% reliable.

**Quick Summary:**
1. Open: https://localhost:9443/admin (admin/admin)
2. Settings → Key Managers → Add Key Manager
3. **Name: `WSO2IS`** (⚠️ CRITICAL: Must be exactly "WSO2IS" - no hyphen!)
4. Type: WSO2-IS
5. Well-Known URL: `https://wso2is:9443/oauth2/token/.well-known/openid-configuration`
6. Click Import → Select all grant types → Save
7. Disable "Resident Key Manager" (Settings → Key Managers → Resident Key Manager → Edit → Disable)

⚠️ **IMPORTANT**: 
- The Key Manager **Name** must be exactly `WSO2IS` (without hyphen) to match the configuration in both APIM and IS
- Resident Key Manager should be **disabled** once WSO2IS Key Manager is added
- If the name differs, token revocation will silently fail!

**Verify:**
```bash
./scripts/wso2-toolkit.sh list-km
```

### 3. Create OAuth2 Application

1. Open WSO2 IS: https://localhost:9444/carbon (admin/admin)
2. Main → Identity → Service Providers → Add
3. Name: `MyApp`
4. Inbound Authentication → OAuth/OpenID Connect → Configure
5. Callback: `http://localhost:8080/callback`
6. Grant Types: Select all needed
7. **Save Client ID & Secret**

### 4. Get Tokens

```bash
# Client Credentials
./scripts/wso2-toolkit.sh get-token cc <CLIENT_ID> <CLIENT_SECRET>

# Password Grant
./scripts/wso2-toolkit.sh get-token password <CLIENT_ID> <CLIENT_SECRET> admin admin

# Refresh Token
./scripts/wso2-toolkit.sh get-token refresh <CLIENT_ID> <CLIENT_SECRET> <REFRESH_TOKEN>
```

## 📋 All OAuth 2.0 Grant Types

| Grant Type | Command | Use Case |
|------------|---------|----------|
| Client Credentials | `get-token cc` | Machine-to-machine |
| Password | `get-token password` | Trusted apps |
| Refresh Token | `get-token refresh` | Token renewal |
| Authorization Code | `get-token code` | Web applications |
| Device Authorization | `get-token device` | Smart TV, IoT |
| JWT Bearer | `get-token jwt` | Service accounts |
| SAML 2.0 Bearer | `get-token saml` | Enterprise SSO |
| Token Exchange | `get-token token-exchange` | Token delegation |
| Implicit | (deprecated) | Legacy SPAs |

## 🛠️ Toolkit Commands

```bash
# Health check all services
./scripts/wso2-toolkit.sh health

# List Key Managers
./scripts/wso2-toolkit.sh list-km

# Test Key Manager endpoints
./scripts/wso2-toolkit.sh test

# Get help
./scripts/wso2-toolkit.sh help
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| WSO2 IS Console | https://localhost:9444/carbon | admin/admin |
| APIM Console | https://localhost:9443/carbon | admin/admin |
| API Publisher | https://localhost:9443/publisher | admin/admin |
| API DevPortal | https://localhost:9443/devportal | admin/admin |
| Admin Portal | https://localhost:9443/admin | admin/admin |
| Gateway HTTPS | https://localhost:8243 | - |
| Gateway HTTP | http://localhost:8280 | - |

## 📁 Key Files

```
money_transfer_app/
├── docker-compose.yml              # Services definition
├── README.md                       # This file
├── MANUAL-KM-SETUP.md             # Key Manager setup guide
├── scripts/
│   ├── wso2-toolkit.sh            # Main toolkit (all grant types)
│   └── check_health.sh            # Health checker
├── wso2am/
│   ├── Dockerfile
│   └── repository/conf/deployment.toml   # APIM configuration
└── wso2is/
    ├── Dockerfile
    └── repository/conf/deployment.toml   # IS configuration
```

## ✅ Fixed Issues

1. **TOML Array Conflict** - Removed `[[apim.key_manager]]` array
2. **Token Revocation Header** - Set to `"WSO2IS"` (matches KM name)
3. **UserInfo Endpoint** - Correct path for IS 7.x: `/scim2/Me`
4. **Admin REST Auth** - Using Basic Auth (simpler, reliable)
5. **Health Checks** - Comprehensive monitoring
6. **All Grant Types** - 9 grant types configured

## 🔧 Troubleshooting

### Services Not Starting
```bash
docker logs wso2am --tail 50
docker logs wso2is --tail 50
docker logs postgres-wso2 --tail 50
```

### Database Issues
```bash
docker exec postgres-wso2 psql -U wso2carbon -d apim_db -c "\dt"
```

### Token Issues
```bash
# Test IS directly
curl -k -X POST https://localhost:9444/oauth2/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials"
```

### Certificate Trust (Production)
For APIM→IS HTTPS calls without SSL errors:
```bash
# Export IS cert
docker exec wso2is keytool -export -alias wso2carbon \
  -keystore /home/wso2carbon/wso2is-7.1.0/repository/resources/security/wso2carbon.jks \
  -file /tmp/wso2is.crt -storepass wso2carbon

# Import to APIM truststore
docker cp wso2is:/tmp/wso2is.crt .
docker cp wso2is.crt wso2am:/tmp/
docker exec wso2am keytool -import -alias wso2is \
  -file /tmp/wso2is.crt \
  -keystore /home/wso2carbon/wso2am-4.5.0/repository/resources/security/client-truststore.jks \
  -storepass wso2carbon -noprompt

# Restart
docker restart wso2am
```

## 📚 Documentation

- **MANUAL-KM-SETUP.md** - Step-by-step Key Manager setup
- **WSO2 APIM Docs** - https://apim.docs.wso2.com/en/latest/
- **WSO2 IS Docs** - https://is.docs.wso2.com/en/latest/

## 🎯 Next Steps

1. ✅ Services running & healthy
2. 📝 **Configure Key Manager** (see MANUAL-KM-SETUP.md)
3. 🔐 Create OAuth2 apps in IS
4. 📡 Create & publish APIs
5. 🚀 Generate tokens & call APIs

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ API Call + Token
       ▼
┌─────────────────────┐
│  APIM Gateway       │ ◄─── Token Validation ─────┐
│  :8243 / :8280      │                            │
└──────┬──────────────┘                            │
       │                                           │
       │ Route to Backend                   ┌──────────────┐
       ▼                                    │  WSO2 IS     │
┌─────────────────────┐                    │  :9444       │
│  Backend Services   │                    │  (Key Mgr)   │
└─────────────────────┘                    └──────┬───────┘
                                                  │
Client ────── Get Token ──────────────────────────┘
              (OAuth2 Grants)

         ┌─────────────────┐
         │  PostgreSQL     │
         │  :5432          │
         │  4 Databases    │
         └─────────────────┘
```

## Support

For issues specific to:
- **WSO2 Products** - https://wso2.com/support
- **This Setup** - Check `docker logs` and `./scripts/wso2-toolkit.sh health`

---

## 🎉 Complete Toolkit Summary

| Script | Purpose | Commands | Status |
|--------|---------|----------|--------|
| `wso2-toolkit.sh` | Infrastructure & OAuth | 25 | ✅ |
| `api-manager.sh` | API Lifecycle | 10 | ✅ |
| `wso2is-user.sh` | User Management | 8 | ✅ |
| **Total** | **Everything!** | **43** | ✅ |

**Complete WSO2 platform management with enterprise-grade security!** 🚀🔒
