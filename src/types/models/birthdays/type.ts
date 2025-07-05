export interface BirthdayFormData {
    name: string;
    birthDate: Date | null;
    category: 'family' | 'friends' | 'colleagues' | 'other';
    email: string;
    phone: string;
    notes: string;
}


export interface Birthday extends BirthdayFormData {
    id: string;
}