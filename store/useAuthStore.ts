import * as LocalAuthentication from "expo-local-authentication";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricType: "fingerprint" | "facial" | "iris" | null;
  checkBiometricSupport: () => Promise<void>;
  authenticate: () => Promise<boolean>;
  lock: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  biometricType: null,

  checkBiometricSupport: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        let biometricType: "fingerprint" | "facial" | "iris" | null = null;
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          )
        ) {
          biometricType = "facial";
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          biometricType = "fingerprint";
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
          biometricType = "iris";
        }

        set({ biometricType, isLoading: false });
      } else {
        set({ biometricType: null, isLoading: false, isAuthenticated: true });
      }
    } catch {
      set({ isLoading: false, isAuthenticated: true });
    }
  },

  authenticate: async () => {
    const { biometricType } = get();

    if (!biometricType) {
      set({ isAuthenticated: true });
      return true;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock SplitMate",
        disableDeviceFallback: false,
      });

      if (result.success) {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  lock: () => {
    set({ isAuthenticated: false });
  },
}));
