export interface Vehicle {
    uuid: string;
    id: number;
    make: string;
    model: string;
    year: number;
    engineSpecs: string;
    horsePower: number;
    torque: string;
    zeroToHundred: string;
    story: string;
    modifications?: string;
}

export interface VehicleWithMedia extends Vehicle {
    created_at: string;
    photo_urls: string[];
}

export interface ProfileData{
    username: string;
    registered: string;
    online: boolean;
    avatar: string;
    about: string;
    social_networks: string;
    vehicles: VehicleWithMedia[];
}