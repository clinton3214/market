// lib/providerConfig.ts
// Central routing configuration for SMS verification providers and pools.
// Editable without touching business logic.

export type ProviderType = '5sim' | 'smspool';

export interface ProviderPoolConfig {
  provider: ProviderType;
  pool?: string | number; // For SMSPool (e.g. 7 = Foxtrot, 12 = Mike, etc.)
  countryCode?: string | number; // SMSPool country ID (e.g. 22 for US_V, 1 for US)
  operator?: string; // For 5sim (e.g. 'virtual22', or highest rate)
}

export interface ProviderConfig {
  // Service defaults:
  // Telegram and Microsoft start on SMSPool. All others start on 5sim.
  serviceDefaults: Record<string, ProviderType>;

  // Specific service + country overrides / defaults
  routes: {
    [service: string]: {
      [country: string]: {
        primary: ProviderPoolConfig;
        fallback: ProviderPoolConfig;
      };
    };
  };

  // Auto-retry & timeout settings
  timeoutSeconds: number; // Duration to wait for code per attempt (start at 2 minutes = 120s)
  maxRetries: number; // Max tries per customer order (maximum 3)
  scoreboardThreshold: number; // Number of historical results to evaluate (50)
  explorationRate: number; // Probability of testing alternate provider/pool (0.10 = 1 in 10)
  maxPriceUsd: number; // Maximum USD price willing to pay on SMSPool
}

export const providerConfig: ProviderConfig = {
  // Telegram and Microsoft start on SMSPool. All other services start on 5sim.
  serviceDefaults: {
    telegram: 'smspool',
    microsoft: 'smspool',
  },

  routes: {
    telegram: {
      usa: {
        // Step 1 verified: United States (Virtual) / US_V is Country ID 22 on SMSPool
        // Verified pool: 7 (Foxtrot - highest stock & 66% verified success rate on US_V)
        primary: {
          provider: 'smspool',
          countryCode: 22, // United States (Virtual) / US_V
          pool: 7, // Foxtrot
        },
        // Fallback: regular United States (Country ID 1 on SMSPool)
        fallback: {
          provider: 'smspool',
          countryCode: 1, // United States
          pool: 7, // Foxtrot
        },
      },
    },
    microsoft: {
      usa: {
        primary: {
          provider: 'smspool',
          countryCode: 22, // United States (Virtual) / US_V
          pool: 7, // Foxtrot
        },
        fallback: {
          provider: 'smspool',
          countryCode: 1, // United States
          pool: 7, // Foxtrot
        },
      },
    },
  },

  timeoutSeconds: 120, // 2 minutes per try
  maxRetries: 3, // Maximum 3 attempts
  scoreboardThreshold: 50, // Last 50 results
  explorationRate: 0.10, // 1 in 10 orders explore alternate
  maxPriceUsd: 2.50, // Ceiling on SMSPool purchases
};

// Helper to determine the initial default provider for a service
export function getDefaultProvider(service: string): ProviderType {
  const norm = service.toLowerCase().trim();
  return providerConfig.serviceDefaults[norm] || '5sim';
}
