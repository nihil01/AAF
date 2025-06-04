class CarModifications {

    private static modifications: { [key: string]: string[] } = {
        "Exhaust System": [
          "Sport muffler",
          "Straight pipe",
          "Titanium exhaust system",
          "Quad exhaust tips",
          "Valvetronic exhaust"
        ],
        "Vinyls & Wraps": [
          "Matte wrap",
          "Color shift (chameleon)",
          "Camouflage wrap",
          "Racing stripes",
          "Custom artwork design"
        ],
        "Interior": [
          "Carbon fiber trim",
          "Racing seats",
          "RGB ambient lighting",
          "Upgraded sound system",
          "Alcantara headliner"
        ],
        "Engine": [
          "ECU remap (chip tuning)",
          "Turbocharger installation",
          "Performance camshafts",
          "High-capacity intercooler",
          "Water/methanol injection"
        ],
        "Suspension & Handling": [
          "Lowered sport suspension",
          "Air suspension",
          "Upgraded sway bars",
          "Quick-ratio steering rack"
        ],
        "Wheels & Tires": [
          "18-inch alloy wheels",
          "Wheel spacers",
          "Semi-slick tires",
          "Run-flat tires",
          "Powder-coated rims"
        ],
        "Aerodynamics": [
          "Rear spoiler",
          "Front splitter",
          "Full aero body kit",
          "Rear diffuser",
          "Side skirts"
        ],
        "Lighting": [
          "LED headlights",
          "Projector headlights",
          "Underglow neon lights",
          "Adaptive headlights",
          "Tinted headlight covers"
        ]
      }
      
      


    public static getChosenModification(modification: string): string[] {
        return this.modifications[modification];
    }

    public static getModifications(): string[] {
        return Object.keys(this.modifications);
    }

}


export default CarModifications;