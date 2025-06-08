import { Preferences } from '@capacitor/preferences';

export class OnboardingPreferences {
    private static readonly ONBOARDING_SHOWN_KEY = 'onboarding_shown';

    static async isOnboardingShown(): Promise<boolean> {
        const { value } = await Preferences.get({ key: this.ONBOARDING_SHOWN_KEY });
        return value === 'true';
    }

    static async setOnboardingShown(): Promise<void> {
        await Preferences.set({
            key: this.ONBOARDING_SHOWN_KEY,
            value: 'true'
        });
    }
} 