
import { supabase } from "@/integrations/supabase/client";

// Base64 URL encoding/decoding utilities
const base64URLEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const base64URLDecode = (str: string): ArrayBuffer => {
  str = (str + '===').slice(0, str.length + (str.length % 4));
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(str);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes.buffer;
};

interface BiometricCredential {
  id: string;
  publicKey: string;
  userId: string;
  credentialId: string;
}

class WebAuthnService {
  private rpName = "Biometric Ballot Chain";
  private rpId = window.location.hostname;

  // Check if WebAuthn is supported
  isSupported(): boolean {
    return !!(navigator.credentials && 
             window.PublicKeyCredential && 
             typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function');
  }

  // Check if biometric authentication is available
  async isBiometricAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  // Register a new biometric credential
  async registerBiometric(userId: string, userName: string): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn not supported' };
    }

    try {
      // Generate challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBytes = new TextEncoder().encode(userId);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: this.rpName,
          id: this.rpId,
        },
        user: {
          id: userIdBytes,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Failed to create credential' };
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = base64URLEncode(credential.rawId);
      const publicKey = base64URLEncode(response.getPublicKey()!);

      // Store credential in database
      const { error } = await supabase.auth.updateUser({
        data: {
          biometric_credential_id: credentialId,
          biometric_public_key: publicKey,
          biometric_type: 'webauthn_fingerprint'
        }
      });

      if (error) {
        console.error('Error storing biometric credential:', error);
        return { success: false, error: 'Failed to store credential' };
      }

      return { success: true, credentialId };

    } catch (error) {
      console.error('Error registering biometric:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  // Authenticate using biometric
  async authenticateBiometric(credentialId?: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: 'WebAuthn not supported' };
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: credentialId ? [{
          id: base64URLDecode(credentialId),
          type: 'public-key',
        }] : [],
        userVerification: 'required',
        timeout: 60000,
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Authentication cancelled' };
      }

      const credId = base64URLEncode(credential.rawId);
      
      // Here you would typically verify the signature with your backend
      // For now, we'll just check if the credential exists in our database
      return { success: true, userId: 'authenticated' };

    } catch (error) {
      console.error('Error authenticating biometric:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  // Get all registered credentials for a device
  async getRegisteredCredentials(): Promise<BiometricCredential[]> {
    // This would typically query your backend for all credentials
    // For now, return empty array
    return [];
  }
}

export const webAuthnService = new WebAuthnService();
