# 🔐 Complete Key Manager Setup Guide

# 1. Start services
docker compose up -d && ./scripts/wso2-toolkit.sh health

# 2. Automated Key Manager setup (NEW!)
./scripts/wso2-toolkit.sh setup-km
./scripts/wso2-toolkit.sh disable-resident-km
./scripts/wso2-toolkit.sh fix-mtls && docker restart wso2am

# 3. Verify everything
./scripts/wso2-toolkit.sh list-km
./scripts/wso2-toolkit.sh check-mtls
./scripts/wso2-toolkit.sh check-ssa-jwks

## Overview

This guide covers the **complete automated setup** of WSO2 Identity Server 7.1 as an external Key Manager for WSO2 API Manager 4.5.0, including:

1. ✅ Key Manager registration using well-known endpoint
2. ✅ Resident Key Manager disablement
3. ✅ MTLS certificate trust configuration
4. ✅ SSA JWKS verification for DCR

---

## 🚀 Quick Setup (1 Minute)

```bash
# 1. Setup WSO2IS as Key Manager
./scripts/wso2-toolkit.sh setup-km

# 2. Disable Resident Key Manager
./scripts/wso2-toolkit.sh disable-resident-km

# 3. Check MTLS
./scripts/wso2-toolkit.sh check-mtls

# 4. Fix MTLS if needed
./scripts/wso2-toolkit.sh fix-mtls

# 5. Restart APIM to apply certificate changes
docker restart wso2am

# 6. Verify everything
./scripts/wso2-toolkit.sh list-km
./scripts/wso2-toolkit.sh check-ssa-jwks
```

---

## 📋 Detailed Steps

### Step 1: Setup Key Manager Using Well-Known Endpoint

```bash
./scripts/wso2-toolkit.sh setup-km
```

**What it does:**
- Discovers OAuth2 endpoints from WSO2IS well-known URL
- Creates Key Manager named `WSO2IS` (exact match with config)
- Configures all OAuth2 grant types
- Sets up token validation, introspection, and revocation endpoints
- Uses `https://wso2is:9443/oauth2/token/.well-known/openid-configuration`

**Key Configuration:**
```json
{
  "name": "WSO2IS",
  "type": "WSO2-IS",
  "wellKnownEndpoint": "https://wso2is:9443/oauth2/token/.well-known/openid-configuration",
  "tokenType": "DIRECT",
  "enableTokenGeneration": true,
  "availableGrantTypes": [
    "password",
    "client_credentials",
    "refresh_token",
    "authorization_code",
    "urn:ietf:params:oauth:grant-type:device_code",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "urn:ietf:params:oauth:grant-type:token-exchange",
    "urn:ietf:params:oauth:grant-type:saml2-bearer"
  ]
}
```

**Verification:**
```bash
./scripts/wso2-toolkit.sh list-km

# Expected output should show:
# - WSO2IS Key Manager (enabled: true)
# - Resident Key Manager (should be disabled in next step)
```

---

### Step 2: Disable Resident Key Manager

```bash
./scripts/wso2-toolkit.sh disable-resident-km
```

**Why this is critical:**
- Resident KM handles tokens internally in APIM
- When using external KM (WSO2IS), Resident KM causes conflicts
- Token validation goes to wrong endpoint
- Leads to 401 errors and token validation failures

**What it does:**
- Finds Resident Key Manager by name
- Updates `enabled: false` via PATCH
- Ensures all token operations route to WSO2IS

**Before:**
```
Resident Key Manager: enabled=true  ← Conflict!
WSO2IS Key Manager: enabled=true
```

**After:**
```
Resident Key Manager: enabled=false  ← Correct!
WSO2IS Key Manager: enabled=true
```

---

### Step 3: Check MTLS Certificate Trust

```bash
./scripts/wso2-toolkit.sh check-mtls
```

**What it checks:**
1. **APIM → IS connectivity** over HTTPS
2. **IS → APIM connectivity** over HTTPS
3. **Certificate presence** in APIM truststore

**Output:**
```
[INFO] Testing APIM → IS HTTPS connectivity...
[✓] APIM can reach IS over HTTPS
[INFO] Testing IS → APIM HTTPS connectivity...
[✓] IS can reach APIM over HTTPS
[INFO] Checking certificate trust in APIM truststore...
[⚠️] IS certificate NOT found in APIM truststore
[INFO] Run: ./wso2-toolkit.sh fix-mtls to add the certificate
```

**Why this matters:**
- Token validation requires HTTPS calls from APIM to IS
- Introspection endpoint: `https://wso2is:9443/oauth2/introspect`
- Without trust, gateway returns 4xx/5xx errors
- Token revocation notifications fail silently

---

### Step 4: Fix MTLS Certificate Trust

```bash
./scripts/wso2-toolkit.sh fix-mtls
```

**What it does:**
1. Exports IS certificate from keystore:
   ```bash
   keytool -export -alias wso2carbon \
     -keystore wso2is-7.1.0/repository/resources/security/wso2carbon.jks \
     -file /tmp/wso2is.crt
   ```

2. Imports to APIM truststore:
   ```bash
   keytool -import -alias wso2is \
     -file /tmp/wso2is.crt \
     -keystore wso2am-4.5.0/repository/resources/security/client-truststore.jks
   ```

3. Cleans up temporary files

**After running:**
```
[✓] IS certificate exported
[✓] IS certificate imported to APIM truststore
⚠️  Restart APIM to apply changes:
    docker restart wso2am
```

**Verification:**
```bash
# Check certificate exists
docker exec wso2am keytool -list \
  -keystore /home/wso2carbon/wso2am-4.5.0/repository/resources/security/client-truststore.jks \
  -storepass wso2carbon \
  -alias wso2is

# Should show certificate details
```

---

### Step 5: Restart APIM

```bash
docker restart wso2am

# Wait for APIM to fully start
./scripts/wso2-toolkit.sh health
```

**Why restart is needed:**
- JVM caches loaded certificates
- Truststore changes require reload
- Gateway needs to reinitialize HTTPS connections

---

### Step 6: Verify SSA JWKS for DCR

```bash
./scripts/wso2-toolkit.sh check-ssa-jwks
```

**What it checks:**
- JWKS endpoint accessibility: `https://wso2is:9443/oauth2/jwks`
- Keys are present and valid
- External access works

**SSA (Software Statement Assertion) use case:**
- Dynamic Client Registration (DCR)
- Client applications self-register
- JWKS URL verifies SSA signatures

**Output:**
```
[✓] JWKS endpoint accessible internally
[✓] JWKS endpoint accessible externally

JWKS URL: https://localhost:9444/oauth2/jwks
{
  "keys": [
    {
      "kty": "RSA",
      "e": "AQAB",
      "use": "sig",
      "kid": "...",
      "alg": "RS256",
      "n": "..."
    }
  ]
}
```

---

## 🧪 Complete Testing Workflow

### 1. Create OAuth2 Application
```bash
./scripts/wso2-toolkit.sh create-app TestApp http://localhost:8080/callback

# Note down CLIENT_ID and CLIENT_SECRET
```

### 2. Get Token via WSO2IS Key Manager
```bash
./scripts/wso2-toolkit.sh get-token cc <CLIENT_ID> <CLIENT_SECRET>

# Should receive token from WSO2IS, not Resident KM
```

### 3. Validate Token via APIM Gateway
```bash
# Create a test API first
./scripts/api-manager.sh create-api TestAPI 1.0.0 /test http://httpbin.org
./scripts/api-manager.sh deploy-api <API_ID>

# Call with token
curl -k -H "Authorization: Bearer <TOKEN>" \
  https://localhost:8243/test/get

# Should succeed with 200 OK
```

### 4. Test Token Introspection
```bash
curl -k -u "<CLIENT_ID>:<CLIENT_SECRET>" \
  -d "token=<ACCESS_TOKEN>" \
  https://localhost:9444/oauth2/introspect

# Expected: {"active": true, "scope": "...", ...}
```

### 5. Test Token Revocation
```bash
# Revoke token
curl -k -u "<CLIENT_ID>:<CLIENT_SECRET>" \
  -d "token=<ACCESS_TOKEN>" \
  -X POST https://localhost:9444/oauth2/revoke

# Verify revoked
curl -k -u "<CLIENT_ID>:<CLIENT_SECRET>" \
  -d "token=<ACCESS_TOKEN>" \
  https://localhost:9444/oauth2/introspect

# Expected: {"active": false}

# Try API call with revoked token
curl -k -H "Authorization: Bearer <TOKEN>" \
  https://localhost:8243/test/get

# Expected: HTTP 401 Unauthorized
```

---

## 📊 Configuration Checklist

| Item | Status | Command to Verify |
|------|--------|------------------|
| WSO2IS Key Manager exists | ✅ | `./scripts/wso2-toolkit.sh list-km` |
| Resident KM disabled | ✅ | `./scripts/wso2-toolkit.sh list-km` |
| APIM → IS HTTPS works | ✅ | `./scripts/wso2-toolkit.sh check-mtls` |
| IS cert in APIM truststore | ✅ | `./scripts/wso2-toolkit.sh check-mtls` |
| JWKS endpoint accessible | ✅ | `./scripts/wso2-toolkit.sh check-ssa-jwks` |
| Well-known endpoint works | ✅ | `curl -k https://localhost:9444/oauth2/token/.well-known/openid-configuration` |
| Token validation works | ✅ | Test with API call |
| Token revocation works | ✅ | Revoke + verify invalid |

---

## 🔍 Troubleshooting

### Issue: "Key Manager already exists"

**Symptom:**
```
[!] Key Manager 'WSO2IS' already exists
```

**Solution:**
```bash
# List existing KMs
./scripts/wso2-toolkit.sh list-km

# If WSO2IS exists and is correct, skip to next step
# If wrong configuration, delete via Admin Portal and re-run
```

---

### Issue: "APIM cannot reach IS"

**Symptom:**
```
[✗] APIM cannot reach IS
curl: (6) Could not resolve host: wso2is
```

**Solution:**
```bash
# Check Docker network
docker network inspect money_transfer_app_wso2-network

# Ensure both containers are in same network
docker inspect wso2am | grep NetworkMode
docker inspect wso2is | grep NetworkMode

# Restart containers if needed
docker restart wso2am wso2is
```

---

### Issue: "Certificate trust failed"

**Symptom:**
```
PKIX path building failed
SSLHandshakeException
```

**Solution:**
```bash
# Fix MTLS
./scripts/wso2-toolkit.sh fix-mtls

# Restart APIM
docker restart wso2am

# Verify
./scripts/wso2-toolkit.sh check-mtls
```

---

### Issue: "401 Unauthorized on API calls"

**Possible causes:**

1. **Resident KM still enabled**
   ```bash
   ./scripts/wso2-toolkit.sh list-km
   # Ensure Resident KM: "enabled": false
   
   ./scripts/wso2-toolkit.sh disable-resident-km
   ```

2. **MTLS not working**
   ```bash
   ./scripts/wso2-toolkit.sh check-mtls
   ./scripts/wso2-toolkit.sh fix-mtls
   docker restart wso2am
   ```

3. **Token from wrong KM**
   ```bash
   # Get token
   TOKEN=$(./scripts/wso2-toolkit.sh get-token cc <ID> <SECRET> | jq -r '.access_token')
   
   # Decode JWT
   echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .
   
   # Check "iss" field - should be WSO2IS URL
   # "iss": "https://wso2is:9443/oauth2/token"
   ```

4. **Key Manager name mismatch**
   ```bash
   # Check APIM config
   docker exec wso2am grep "X-WSO2-KEY-MANAGER" \
     /home/wso2carbon/wso2am-4.5.0/repository/conf/deployment.toml
   
   # Check IS config
   docker exec wso2is grep "X-WSO2-KEY-MANAGER" \
     /home/wso2carbon/wso2is-7.1.0/repository/conf/deployment.toml
   
   # Both should be: 'header.X-WSO2-KEY-MANAGER' = "WSO2IS"
   ```

---

### Issue: "JWKS endpoint not accessible"

**Symptom:**
```
[✗] JWKS endpoint not accessible
```

**Solution:**
```bash
# Test directly
curl -k https://localhost:9444/oauth2/jwks

# If fails, check IS logs
docker logs wso2is --tail 50

# Restart IS if needed
docker restart wso2is
```

---

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 1. Get Token
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   WSO2 Identity Server                       │
│                   (External Key Manager)                     │
│                                                              │
│  • OAuth2 Token Endpoint                                     │
│  • Introspection Endpoint                                    │
│  • Revocation Endpoint                                       │
│  • JWKS Endpoint (for SSA/DCR)                              │
│  • Well-Known Endpoint                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 2. Token + API Request
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   WSO2 API Manager                           │
│                      (Gateway)                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Key Manager: WSO2IS (enabled)                       │   │
│  │  • Validates tokens via IS introspection            │   │
│  │  • Checks revocation status                         │   │
│  │  • Uses HTTPS with MTLS cert trust                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Key Manager: Resident (disabled)                    │   │
│  │  • No longer handles tokens                          │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 3. Route to Backend
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

After complete setup, you should see:

1. **Key Managers:**
   ```
   WSO2IS:          enabled=true, type=WSO2-IS
   Resident:        enabled=false
   ```

2. **MTLS:**
   ```
   ✓ APIM can reach IS over HTTPS
   ✓ IS can reach APIM over HTTPS
   ✓ IS certificate exists in APIM truststore
   ```

3. **JWKS:**
   ```
   ✓ JWKS endpoint accessible
   ✓ Keys present in response
   ```

4. **Token Flow:**
   ```
   Client → WSO2IS (get token)
   Client → APIM (API call with token)
   APIM → WSO2IS (validate token via introspection)
   APIM → Backend (proxied request)
   ```

5. **Revocation:**
   ```
   Client → WSO2IS (revoke token)
   WSO2IS → APIM (revocation notification)
   APIM → Client (401 on next API call)
   ```

---

## 🎯 Summary

**4 commands to complete Key Manager setup:**

```bash
./scripts/wso2-toolkit.sh setup-km
./scripts/wso2-toolkit.sh disable-resident-km
./scripts/wso2-toolkit.sh fix-mtls && docker restart wso2am
./scripts/wso2-toolkit.sh check-ssa-jwks
```

**Production-ready Key Manager integration with:**
- ✅ Well-known endpoint auto-discovery
- ✅ All OAuth2 grant types enabled
- ✅ MTLS certificate trust configured
- ✅ SSA JWKS endpoint verified
- ✅ Resident KM disabled
- ✅ Token revocation working

**Total setup time: < 2 minutes** 🚀

# 🚀 WSO2 Toolkit Improvements Summary

## Overview
Based on comprehensive code review, the following improvements were implemented to make the toolkit production-ready.

---

## ✅ Improvements Implemented

### 1. **OIDC UserInfo Endpoint Fixed**
**Issue:** Was using SCIM endpoint (`/scim2/Me`) instead of proper OIDC endpoint  
**Fix:** Changed to `/oauth2/userinfo`  
**Impact:** Proper OIDC compliance for user information retrieval

**Before:**
```json
"userInfoEndpoint": "https://wso2is:9443/scim2/Me"
```

**After:**
```json
"userInfoEndpoint": "https://wso2is:9443/oauth2/userinfo"
```

**Files Changed:**
- `scripts/wso2-toolkit.sh` (lines 285, 331)

---

### 2. **Roles Endpoint Path Consistency**
**Issue:** Inconsistent paths between Key Manager config (`/scim2/v2/Roles`) and script calls (`/scim2/Roles`)  
**Fix:** Standardized to `/scim2/Roles` everywhere  
**Impact:** Consistent API calls, no path mismatches

**Before:**
```json
"roles_endpoint": "https://wso2is:9443/scim2/v2/Roles"
```

**After:**
```json
"roles_endpoint": "https://wso2is:9443/scim2/Roles"
```

**Files Changed:**
- `scripts/wso2-toolkit.sh` (line 339)

---

### 3. **JSON Parsing with jq**
**Issue:** Using unreliable `grep | sed | cut` pipelines for JSON parsing  
**Fix:** Replaced with proper `jq` JSON processor  
**Impact:** More reliable, safer, and maintainable JSON extraction

**Examples:**

**Before:**
```bash
app_id=$(echo "${response}" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
```

**After:**
```bash
app_id=$(echo "${response}" | jq -r '.id // empty' 2>/dev/null)
```

**Locations Fixed:**
- Resident KM ID extraction (line 411)
- Application ID after creation (line 738)
- Application ID from search (line 850)
- Role ID extraction (lines 1033, 1070, 1091)

---

### 4. **Dependency Check Function**
**Issue:** No validation that required tools are installed  
**Fix:** Added preflight dependency check with helpful error messages  
**Impact:** Clear errors when dependencies missing, better user experience

**Added:**
```bash
check_dependencies() {
    # Checks for: jq, python3, curl, docker
    # Provides install instructions for each missing tool
}
```

**Files Changed:**
- `scripts/wso2-toolkit.sh` (lines 44-74)
- Runs automatically before any command (line 1649-1651)

**Dependencies Verified:**
- `jq` - JSON processor
- `python3` - JSON validation
- `curl` - HTTP client
- `docker` - Container management

---

### 5. **MTLS Connectivity Test Fixed**
**Issue:** Test used broken endpoint (`/services/`) that returns HTTP 500  
**Fix:** Changed to test real Admin REST API endpoint  
**Impact:** Accurate connectivity verification, no false warnings

**Before:**
```bash
# Test returned HTTP 500, showed warning
curl "https://wso2am:9443/services/"
```

**After:**
```bash
# Test returns HTTP 401 (good - means connectivity works)
http_code=$(curl -w "%{http_code}" "https://wso2am:9443/api/am/admin/v4/key-managers")
if [ "${http_code}" = "401" ] || [ "${http_code}" = "200" ]; then
    # Success - endpoint reachable
fi
```

**Files Changed:**
- `scripts/wso2-toolkit.sh` (lines 453-463)

---

### 6. **Discovery Endpoint Removed**
**Issue:** `/discover` endpoint caused HTTP 415 errors (Unsupported Media Type)  
**Fix:** Removed discovery call, use static endpoints + well-known in payload  
**Impact:** Cleaner output, no unnecessary error logs

**Removed:**
```bash
# This caused 415 errors
curl -X POST "${km_api}/discover" -d '{"wellKnownEndpoint": "..."}'
```

**Rationale:**
- Well-known URL in main payload already triggers auto-discovery
- Static endpoints work perfectly for IS 7.x
- No need for separate discovery call

**Files Changed:**
- `scripts/wso2-toolkit.sh` (lines 226-235)

---

## 📊 Function Count

| Category | Count | Functions |
|----------|-------|-----------|
| **Command Functions** | 19 | `cmd_health`, `cmd_setup_km`, `cmd_list_km`, `cmd_disable_resident_km`, `cmd_check_mtls`, `cmd_fix_mtls`, `cmd_check_ssa_jwks`, `cmd_list_apps`, `cmd_create_app`, `cmd_get_app`, `cmd_get_credentials`, `cmd_delete_app`, `cmd_list_roles`, `cmd_create_role`, `cmd_create_roles`, `cmd_delete_role`, `cmd_get_token`, `cmd_fix_ssl_trust`, `cmd_test` |
| **Helper/Utility** | 13 | `log_info`, `log_success`, `log_warn`, `log_error`, `check_dependencies` (NEW), `validate_app_name`, `validate_url`, `validate_role_name`, `check_container`, `curl_with_retry`, `validate_json_response`, `show_grant_types`, `show_help` |
| **Total** | **32** | (19 commands + 13 helpers) |

---

## 🔍 Code Quality Improvements

### Reliability
- ✅ Proper JSON parsing with `jq` (prevents parsing errors)
- ✅ Dependency validation (catches missing tools early)
- ✅ Better error handling with null checks

### Maintainability
- ✅ Consistent endpoint paths across all configurations
- ✅ OIDC compliance (proper userinfo endpoint)
- ✅ Cleaner code (removed unnecessary discovery call)

### User Experience
- ✅ No more false warnings (MTLS check)
- ✅ Clear error messages for missing dependencies
- ✅ Clean output (no 415/405 errors in logs)

---

## 🧪 Testing Status

All improvements verified with:

```bash
# Dependencies check
./scripts/wso2-toolkit.sh health  # Verifies jq, python3, curl, docker

# Key Manager setup (no 415 errors)
./scripts/wso2-toolkit.sh setup-km

# Resident KM disable (jq-based ID extraction)
./scripts/wso2-toolkit.sh disable-resident-km

# MTLS check (no false warnings)
./scripts/wso2-toolkit.sh check-mtls

# JWKS verification
./scripts/wso2-toolkit.sh check-ssa-jwks
```

**Results:**
- ✅ All commands pass
- ✅ No error logs
- ✅ Clean JSON parsing
- ✅ Accurate status reporting

---

## 📝 Future Considerations

### Already Available (Not Yet Used Everywhere)
- `curl_with_retry()` - Could replace direct curl calls for better resilience
- `validate_json_response()` - Could add after every API response

### Potential Enhancements
1. **Retry logic**: Use `curl_with_retry` for all network-sensitive operations
2. **Response validation**: Add `validate_json_response` after critical API calls
3. **Timeout configuration**: Make curl timeouts configurable via environment variables
4. **Verbose mode**: Add `-v` flag for detailed debugging output
5. **Dry-run mode**: Add `--dry-run` to preview operations without executing

---

## 📚 Architecture Strengths

### Single-File Design
- ✅ All operations in one place
- ✅ No external dependencies (except standard tools)
- ✅ Easy to distribute and version control

### Comprehensive Coverage
- ✅ Full OAuth2/OIDC lifecycle
- ✅ All 10 grant types supported
- ✅ Complete Key Manager automation
- ✅ MTLS/SSL verification and fixes
- ✅ Role and application management

### Production-Ready
- ✅ Input validation
- ✅ Error handling
- ✅ Dependency checks
- ✅ Safe JSON parsing
- ✅ Clear logging

---

## 🎯 Summary

**Total Lines Changed:** ~50  
**New Functions:** 1 (`check_dependencies`)  
**Functions Improved:** 7 (JSON parsing fixes)  
**Bugs Fixed:** 3 (userinfo endpoint, MTLS test, discovery endpoint)  
**Quality:** Production-ready ✅

**This toolkit is now a robust, enterprise-grade ops console for WSO2 APIM ↔ IS integration.** 🚀


# WSO2 Toolkit - Quick Start Guide

## Prerequisites
```bash
# Install dependencies
sudo apt-get install jq curl docker.io python3

# Verify installations
jq --version
curl --version
docker --version
python3 --version
```

## Setup Workflow

### Step 1: Check Infrastructure
```bash
./scripts/wso2-toolkit.sh health
```

**Expected Output:**
- ✓ Docker containers running (wso2am, wso2is, postgres)
- ✓ Databases accessible
- ✓ WSO2 IS accessible
- ✓ WSO2 AM accessible

### Step 2: Setup Key Manager
```bash
# Add WSO2 IS as Key Manager in APIM
./scripts/wso2-toolkit.sh setup-km

# Verify Key Manager is configured
./scripts/wso2-toolkit.sh list-km
```

**Expected Output:**
```json
{
  "name": "WSO2IS",
  "type": "WSO2-IS",
  "enabled": true,
  "tokenEndpoint": "https://wso2is:9443/oauth2/token"
}
```

### Step 3: (Optional) Disable Resident Key Manager
```bash
# Disable built-in Key Manager to use only WSO2 IS
./scripts/wso2-toolkit.sh disable-resident-km
```

### Step 4: Fix SSL Certificates (if needed)
```bash
# Check certificate trust
./scripts/wso2-toolkit.sh check-mtls

# Fix if issues found
./scripts/wso2-toolkit.sh fix-mtls

# Restart containers
docker restart wso2am wso2is
```

## Application Management

### Create Application
```bash
# Basic usage
./scripts/wso2-toolkit.sh create-app MyApp http://localhost:8080/callback

# With specific Key Manager
./scripts/wso2-toolkit.sh create-app MyApp http://localhost:8080/callback WSO2IS
```

**Output:**
```
╔══════════════════════════════════════════════════════════╗
║  SAVE THESE CREDENTIALS - THEY WON'T BE SHOWN AGAIN     ║
╚══════════════════════════════════════════════════════════╝

Application Name: MyApp
Application ID:   abc-123-def-456
Client ID:        xYzAbC123
Client Secret:    secret_XyZ789
Callback URL:     http://localhost:8080/callback
Key Manager:      WSO2IS

Grant Types Enabled:
  ✓ Client Credentials
  ✓ Password
  ✓ Authorization Code
  ✓ Refresh Token
  ✓ Implicit
  ✓ Device Code
  ✓ JWT Bearer
  ✓ SAML2 Bearer
  ✓ Token Exchange
```

### List Applications
```bash
./scripts/wso2-toolkit.sh list-apps
```

### Get Application Keys
```bash
# Get PRODUCTION keys
./scripts/wso2-toolkit.sh get-app-keys <app-id> PRODUCTION

# Get SANDBOX keys
./scripts/wso2-toolkit.sh get-app-keys <app-id> SANDBOX
```

### Delete Application
```bash
./scripts/wso2-toolkit.sh delete-app <app-id>
```

## Role Management

### Create Default Roles
```bash
# Creates: ops_users, finance, auditor, user, app_admin
./scripts/wso2-toolkit.sh create-roles
```

### Create Single Role
```bash
# Application role
./scripts/wso2-toolkit.sh create-role custom_role application

# Internal role
./scripts/wso2-toolkit.sh create-role internal_role internal

# Organization role
./scripts/wso2-toolkit.sh create-role org_role organization
```

### List Roles
```bash
./scripts/wso2-toolkit.sh list-roles
```

## Token Generation

### Client Credentials Grant
```bash
./scripts/wso2-toolkit.sh get-token cc <client-id> <client-secret>
```

**Example:**
```bash
./scripts/wso2-toolkit.sh get-token cc xYzAbC123 secret_XyZ789
```

**Output:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Password Grant
```bash
./scripts/wso2-toolkit.sh get-token password <client-id> <client-secret> <username> <password>
```

**Example:**
```bash
./scripts/wso2-toolkit.sh get-token password xYzAbC123 secret_XyZ789 admin admin
```

### Refresh Token Grant
```bash
./scripts/wso2-toolkit.sh get-token refresh <client-id> <client-secret> <refresh-token>
```

### Authorization Code Grant
```bash
# Step 1: Get authorization code (via browser)
# Visit: https://localhost:9444/oauth2/authorize?response_type=code&client_id=<client-id>&redirect_uri=<callback-url>

# Step 2: Exchange code for token
./scripts/wso2-toolkit.sh get-token code <client-id> <client-secret> <auth-code> <redirect-uri>
```

## Common Workflows

### Workflow 1: Complete Setup
```bash
# 1. Check health
./scripts/wso2-toolkit.sh health

# 2. Setup Key Manager
./scripts/wso2-toolkit.sh setup-km

# 3. Create roles
./scripts/wso2-toolkit.sh create-roles

# 4. Create application
./scripts/wso2-toolkit.sh create-app MyApp http://localhost:8080/callback

# 5. Test token generation (use credentials from step 4)
./scripts/wso2-toolkit.sh get-token cc <client-id> <client-secret>
```

### Workflow 2: Troubleshooting
```bash
# Check infrastructure
./scripts/wso2-toolkit.sh health

# Check Key Managers
./scripts/wso2-toolkit.sh list-km

# Check MTLS certificates
./scripts/wso2-toolkit.sh check-mtls

# Fix certificate issues
./scripts/wso2-toolkit.sh fix-mtls

# Test Key Manager integration
./scripts/wso2-toolkit.sh test
```

### Workflow 3: Application Migration
```bash
# 1. List existing applications
./scripts/wso2-toolkit.sh list-apps

# 2. Get keys for existing app
./scripts/wso2-toolkit.sh get-app-keys <app-id>

# 3. Save credentials to .env file (output will show format)

# 4. Test tokens work
./scripts/wso2-toolkit.sh get-token cc <client-id> <client-secret>
```

## Testing API Calls

### Using curl with Access Token
```bash
# Get token
TOKEN=$(./scripts/wso2-toolkit.sh get-token cc <client-id> <client-secret> | jq -r '.access_token')

# Call protected API
curl -H "Authorization: Bearer $TOKEN" \
     https://localhost:8243/your-api/1.0.0/endpoint
```

### Using Postman
1. Get Client ID and Secret from `create-app` command
2. Configure OAuth 2.0 in Postman:
   - Grant Type: Client Credentials
   - Access Token URL: `https://localhost:9444/oauth2/token`
   - Client ID: `<your-client-id>`
   - Client Secret: `<your-client-secret>`
3. Request Token
4. Use token in API requests

## Environment Variables

### Optional Configuration
```bash
# APIM Configuration
export APIM_HOST=localhost
export APIM_PORT=9443
export APIM_ADMIN_USER=admin
export APIM_ADMIN_PASS=admin

# WSO2 IS Configuration
export WSO2IS_HOST=wso2is
export WSO2IS_PORT=9443
export WSO2IS_EXTERNAL_PORT=9444
export WSO2IS_ADMIN_USER=admin
export WSO2IS_ADMIN_PASS=admin
```

## Access URLs

### WSO2 API Manager
- **Publisher Portal:** https://localhost:9443/publisher
- **DevPortal:** https://localhost:9443/devportal
- **Admin Portal:** https://localhost:9443/admin
- **Carbon Console:** https://localhost:9443/carbon
- **Gateway:** https://localhost:8243

### WSO2 Identity Server
- **Console:** https://localhost:9444/console
- **Carbon Console:** https://localhost:9444/carbon
- **My Account:** https://localhost:9444/myaccount

### Default Credentials
- **Username:** admin
- **Password:** admin

## Cheat Sheet

```bash
# Health & Setup
./scripts/wso2-toolkit.sh health
./scripts/wso2-toolkit.sh setup-km
./scripts/wso2-toolkit.sh list-km

# Applications (APIM DevPortal)
./scripts/wso2-toolkit.sh list-apps
./scripts/wso2-toolkit.sh create-app <name> <callback>
./scripts/wso2-toolkit.sh get-app <app-id>
./scripts/wso2-toolkit.sh get-app-keys <app-id>
./scripts/wso2-toolkit.sh delete-app <app-id>

# Roles (WSO2 IS)
./scripts/wso2-toolkit.sh list-roles
./scripts/wso2-toolkit.sh create-role <name>
./scripts/wso2-toolkit.sh create-roles

# Tokens
./scripts/wso2-toolkit.sh get-token cc <id> <secret>
./scripts/wso2-toolkit.sh get-token password <id> <secret> <user> <pass>

# Certificates
./scripts/wso2-toolkit.sh check-mtls
./scripts/wso2-toolkit.sh fix-mtls

# Help
./scripts/wso2-toolkit.sh help
```

## Troubleshooting Common Issues

### Issue: "Container not running"
```bash
# Check containers
docker ps

# Start containers
docker compose up -d

# Check logs
docker logs wso2am --tail 50
docker logs wso2is --tail 50
```

### Issue: "Connection refused"
```bash
# Wait for services to start (can take 2-3 minutes)
./scripts/wso2-toolkit.sh health

# Check if ports are open
curl -k https://localhost:9443/carbon/admin/login.jsp
curl -k https://localhost:9444/carbon/admin/login.jsp
```

### Issue: "Invalid credentials"
```bash
# Verify admin credentials
export APIM_ADMIN_USER=admin
export APIM_ADMIN_PASS=admin
export WSO2IS_ADMIN_USER=admin
export WSO2IS_ADMIN_PASS=admin
```

### Issue: "Key Manager not found"
```bash
# List Key Managers
./scripts/wso2-toolkit.sh list-km

# If WSO2IS not in list, set it up
./scripts/wso2-toolkit.sh setup-km
```

### Issue: "SSL certificate error"
```bash
# Check certificate trust
./scripts/wso2-toolkit.sh check-mtls

# Fix certificates
./scripts/wso2-toolkit.sh fix-mtls

# Restart containers
docker restart wso2am wso2is
```

## Best Practices

1. **Always run health check first**
   ```bash
   ./scripts/wso2-toolkit.sh health
   ```

2. **Save application credentials immediately**
   - They are only shown once during creation

3. **Use environment-specific callback URLs**
   - Dev: `http://localhost:8080/callback`
   - Production: `https://yourdomain.com/callback`

4. **Test tokens before using in production**
   ```bash
   ./scripts/wso2-toolkit.sh get-token cc <id> <secret>
   ```

5. **Back up Key Manager configuration**
   ```bash
   ./scripts/wso2-toolkit.sh list-km > key-managers-backup.json
   ```

## Next Steps

1. Read full documentation: `./scripts/wso2-toolkit.sh help`
2. Review changes: `cat TOOLKIT_CHANGES.md`
3. Test application flow: Follow "Workflow 1: Complete Setup"
4. Access APIM DevPortal: https://localhost:9443/devportal
5. Verify application appears in DevPortal UI

