import type { DataProvider } from '@refinedev/core';
import dayjs from 'dayjs';

interface Birthday {
    id: string;
    name: string;
    birthDate: string;
    category: 'family' | 'friends' | 'colleagues' | 'other';
    email?: string;
    phone?: string;
    notes?: string;
}

const sampleBirthdays: Birthday[] = [
    {
        id: '1',
        name: 'John Doe',
        birthDate: '1990-03-15',
        category: 'friends',
        email: 'john@example.com',
        phone: '+1 555-0123',
        notes: 'College friend, loves hiking'
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        birthDate: '1985-07-22',
        category: 'family',
        email: 'sarah@example.com',
        phone: '+1 555-0456',
        notes: 'Sister, always forgets her own birthday'
    },
    {
        id: '3',
        name: 'Mike Chen',
        birthDate: '1992-12-08',
        category: 'colleagues',
        email: 'mike.chen@company.com',
        phone: '+1 555-0789',
        notes: 'Team lead, great at coding'
    },
    {
        id: '4',
        name: 'Emily Rodriguez',
        birthDate: '1988-05-03',
        category: 'friends',
        email: 'emily@example.com',
        notes: 'Childhood friend, loves photography'
    },
    {
        id: '5',
        name: 'David Wilson',
        birthDate: '1995-11-18',
        category: 'colleagues',
        email: 'david.wilson@company.com',
        phone: '+1 555-0321',
        notes: 'Designer, very creative'
    },
    {
        id: '6',
        name: 'Lisa Taylor',
        birthDate: '1987-01-25',
        category: 'family',
        email: 'lisa@example.com',
        phone: '+1 555-0654',
        notes: 'Cousin, lives in California'
    },
    {
        id: '7',
        name: 'Alex Brown',
        birthDate: dayjs().add(3, 'day').format('YYYY-MM-DD'), // 3 days from now
        category: 'friends',
        email: 'alex@example.com',
        phone: '+1 555-0987',
        notes: 'Birthday coming up soon!'
    },
    {
        id: '8',
        name: 'Maria Garcia',
        birthDate: dayjs().add(1, 'day').format('YYYY-MM-DD'), // Tomorrow
        category: 'colleagues',
        email: 'maria@company.com',
        phone: '+1 555-0147',
        notes: 'HR manager, very organized'
    },
    {
        id: '9',
        name: 'Tom Anderson',
        birthDate: dayjs().format('YYYY-MM-DD'), // Today
        category: 'family',
        email: 'tom@example.com',
        phone: '+1 555-0258',
        notes: 'Uncle, birthday is today!'
    },
    {
        id: '10',
        name: 'Rachel Green',
        birthDate: '1993-09-12',
        category: 'other',
        email: 'rachel@example.com',
        notes: 'Neighbor, very friendly'
    }
];

// In-memory storage
let birthdays: Birthday[] = [...sampleBirthdays];
let nextId = 11;

const mockDataProvider: DataProvider = {
    getList: async ({ resource, pagination, sorters, filters }) => {
        if (resource === 'birthdays') {
            let data = [...birthdays];

            // Apply filters
            if (filters) {
                filters.forEach((filter) => {
                    if (filter.field === 'category' && filter.value) {
                        data = data.filter(item => item.category === filter.value);
                    }
                    if (filter.field === 'name' && filter.value) {
                        data = data.filter(item =>
                            item.name.toLowerCase().includes(filter.value.toLowerCase())
                        );
                    }
                });
            }

            // Apply sorting
            if (sorters && sorters.length > 0) {
                const sorter = sorters[0];
                data.sort((a, b) => {
                    const aValue = a[sorter.field as keyof Birthday];
                    const bValue = b[sorter.field as keyof Birthday];

                    if (sorter.order === 'desc') {
                        return bValue > aValue ? 1 : -1;
                    }
                    return aValue > bValue ? 1 : -1;
                });
            }

            // Apply pagination
            const start = ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10);
            const end = start + (pagination?.pageSize || 10);
            const paginatedData = data.slice(start, end);

            return {
                data: paginatedData,
                total: data.length,
            };
        }

        return { data: [], total: 0 };
    },

    getOne: async ({ resource, id }) => {
        if (resource === 'birthdays') {
            const birthday = birthdays.find(item => item.id === id);
            if (!birthday) {
                throw new Error('Birthday not found');
            }
            return { data: birthday };
        }

        throw new Error('Resource not found');
    },

    create: async ({ resource, variables }) => {
        if (resource === 'birthdays') {
            const newBirthday: Birthday = {
                id: String(nextId++),
                ...(variables as Omit<Birthday, 'id'>),
            };
            birthdays.push(newBirthday);
            return { data: newBirthday };
        }

        throw new Error('Resource not found');
    },

    update: async ({ resource, id, variables }) => {
        if (resource === 'birthdays') {
            const index = birthdays.findIndex(item => item.id === id);
            if (index === -1) {
                throw new Error('Birthday not found');
            }

            birthdays[index] = {
                ...birthdays[index],
                ...(variables as Partial<Birthday>),
            };

            return { data: birthdays[index] };
        }

        throw new Error('Resource not found');
    },

    deleteOne: async ({ resource, id }) => {
        if (resource === 'birthdays') {
            const index = birthdays.findIndex(item => item.id === id);
            if (index === -1) {
                throw new Error('Birthday not found');
            }

            const deletedBirthday = birthdays[index];
            birthdays.splice(index, 1);
            return { data: deletedBirthday };
        }

        throw new Error('Resource not found');
    },

    getApiUrl: () => 'mock://api',
    custom: async () => {
        throw new Error('Custom method not implemented');
    },
};

export default mockDataProvider; 