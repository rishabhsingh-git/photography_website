#!/bin/bash
# Script to verify OCI environment variables are properly set
# Usage: ./scripts/verify-oci-env.sh [.env.development]

ENV_FILE="${1:-.env.development}"

echo "🔍 Verifying OCI environment variables in: $ENV_FILE"
echo ""

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: File $ENV_FILE not found!"
  exit 1
fi

# Required OCI variables
REQUIRED_VARS=(
  "OCI_TENANCY_OCID"
  "OCI_USER_OCID"
  "OCI_FINGERPRINT"
  "OCI_PRIVATE_KEY"
  "OCI_REGION"
  "OCI_NAMESPACE"
  "OCI_BUCKET_NAME"
)

MISSING_VARS=()
INVALID_VARS=()

# Check each required variable
for var in "${REQUIRED_VARS[@]}"; do
  value=$(grep "^${var}=" "$ENV_FILE" | cut -d '=' -f2- | sed 's/^"//;s/"$//')
  
  if [ -z "$value" ]; then
    MISSING_VARS+=("$var")
    echo "❌ $var: NOT SET"
  else
    # Special validation for private key
    if [ "$var" = "OCI_PRIVATE_KEY" ]; then
      if [[ "$value" != *"BEGIN"* ]] || [[ "$value" != *"PRIVATE KEY"* ]] || [[ "$value" != *"END"* ]]; then
        INVALID_VARS+=("$var (invalid format)")
        echo "⚠️  $var: SET but format appears invalid (missing BEGIN/END markers)"
      else
        key_length=${#value}
        echo "✅ $var: SET (length: $key_length chars)"
      fi
    else
      # For other vars, just check if they're not empty
      if [ ${#value} -lt 5 ]; then
        INVALID_VARS+=("$var (too short)")
        echo "⚠️  $var: SET but value seems too short"
      else
        echo "✅ $var: SET"
      fi
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#MISSING_VARS[@]} -eq 0 ] && [ ${#INVALID_VARS[@]} -eq 0 ]; then
  echo "✅ All OCI environment variables are properly configured!"
  exit 0
else
  if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing variables:"
    for var in "${MISSING_VARS[@]}"; do
      echo "   - $var"
    done
  fi
  
  if [ ${#INVALID_VARS[@]} -gt 0 ]; then
    echo "⚠️  Invalid variables:"
    for var in "${INVALID_VARS[@]}"; do
      echo "   - $var"
    done
  fi
  
  echo ""
  echo "📝 Please check your $ENV_FILE file and ensure:"
  echo "   1. All required variables are set"
  echo "   2. OCI_PRIVATE_KEY uses \\n for newlines (not actual newlines)"
  echo "   3. OCI_PRIVATE_KEY includes BEGIN and END markers"
  echo "   4. Values are properly quoted if they contain special characters"
  exit 1
fi

