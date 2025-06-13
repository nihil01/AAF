export interface Vehicle {
    make: string;
    model: string;
    year: number;
    engineSpecs: string;
    horsePower: number;
    torque: number;
    zeroToHundred: number;
    story: string;
    modifications: string; // JSON string of modifications array
    createdAt: string;
    photourls: (string | null)[];
}

export interface ProfileData {
    username: string;
    registered: string;
    vehicles: Vehicle[];
}
