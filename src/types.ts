export type Attributes = {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
};

export type Class = "Barbarian" | "Wizard" | "Bard";

export type Character = {
    id?: string;
    attributes: Attributes;
    skillPoints: Record<string, number>;
    selectedClass: Class | null;
};
