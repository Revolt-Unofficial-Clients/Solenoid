declare interface SolenoidBadge {
    id: string[] | string;
    title: string;
    colour?: string;
    bkg?: string;
    url?: string;
}

import solenoidBadges from "./badges.json";

export const badges: SolenoidBadge[] = solenoidBadges;
