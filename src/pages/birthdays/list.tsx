import { useState, useMemo } from 'react';
import { useList } from '@refinedev/core';
import {
    Title,
    Text,
    Group,
    Badge,
    Stack,
    TextInput,
    Select,
    Button,
    ActionIcon,
    Paper,
    Box,
    Loader,
    Center,
    Alert,
    Table,
    Menu,
} from '@mantine/core';
import { IconSearch, IconPlus, IconEdit, IconEye, IconTrash, IconCopy, IconDotsVertical, IconFilter, IconRefresh } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDelete } from '@refinedev/core';
import dayjs from 'dayjs';

import type { Birthday } from '../../types/models/birthdays/type';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/constant';

export default function BirthdayList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const navigate = useNavigate();

    const { data, isLoading, error, refetch } = useList<Birthday>({
        resource: 'birthdays',
        pagination: { mode: 'off' },
    });

    const { mutate: deleteBirthday } = useDelete();

    const birthdays = data?.data || [];
    const cleanBirthdays = birthdays.map((birthday) => ({
        ...birthday,
        birthDate: birthday.birthDate?.toString() || '',
    }));

    // Calculate days until next birthday
    const getDaysUntilBirthday = (birthDate: string) => {
        const today = dayjs();
        const currentYear = today.year();
        let nextBirthday = dayjs(birthDate).year(currentYear);

        // If birthday has passed this year, calculate for next year
        if (nextBirthday.isBefore(today, 'day')) {
            nextBirthday = nextBirthday.year(currentYear + 1);
        }

        return nextBirthday.diff(today, 'day');
    };

    const getAge = (birthDate: string) => {
        return dayjs().diff(dayjs(birthDate), 'year');
    };

    const isUpcoming = (birthDate: string) => {
        const daysUntil = getDaysUntilBirthday(birthDate);
        return daysUntil <= 7 && daysUntil >= 0;
    };

    const filteredAndSortedBirthdays = useMemo(() => {
        let filtered = birthdays;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(birthday =>
                birthday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                birthday.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(birthday => birthday.category === categoryFilter);
        }

        // Sort by proximity to current date
        return filtered.sort((a, b) => {
            const daysA = getDaysUntilBirthday(a.birthDate?.toString() || '');
            const daysB = getDaysUntilBirthday(b.birthDate?.toString() || '');
            return daysA - daysB;
        });
    }, [birthdays, searchTerm, categoryFilter]);

    const handleDelete = (birthday: Birthday) => {
        modals.openConfirmModal({
            title: 'Delete Birthday',
            children: (
                <Text>
                    Are you sure you want to delete <strong>{birthday.name}</strong>'s birthday?
                    This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteBirthday({
                    resource: 'birthdays',
                    id: birthday.id,
                }, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Success',
                            message: 'Birthday deleted successfully!',
                            color: 'green',
                        });
                        refetch();
                    },
                    onError: () => {
                        notifications.show({
                            title: 'Error',
                            message: 'Failed to delete birthday. Please try again.',
                            color: 'red',
                        });
                    },
                });
            },
        });
    };

    if (isLoading) {
        return (
            <Center style={{ height: '50vh' }}>
                <Loader size="lg" />
            </Center>
        );
    }

    if (error) {
        return (
            <Alert color="red" title="Error">
                Failed to load birthdays. Please try again later.
            </Alert>
        );
    }

    return (
        <Stack gap="lg">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
                <Box>
                    <Title order={1} mb="xs">Birthdays</Title>
                    <Text c="dimmed" size="sm">
                        Manage and track birthdays for your friends, family, and colleagues
                    </Text>
                </Box>
                <Group>
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => refetch()}
                        title="Refresh"
                    >
                        <IconRefresh size={20} />
                    </ActionIcon>
                    <Button
                        component={Link}
                        to="/birthdays/create"
                        leftSection={<IconPlus size={16} />}
                        variant="filled"
                    >
                        Add Birthday
                    </Button>
                </Group>
            </Group>

            {/* Filters */}
            <Paper p="md" withBorder>
                <Group>
                    <TextInput
                        placeholder="Search by name or email..."
                        leftSection={<IconSearch size={16} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="Filter by category"
                        leftSection={<IconFilter size={16} />}
                        w={200}
                        data={[
                            { value: 'all', label: 'All Categories' },
                            { value: 'family', label: 'Family' },
                            { value: 'friends', label: 'Friends' },
                            { value: 'colleagues', label: 'Colleagues' },
                            { value: 'other', label: 'Other' },
                        ]}
                        value={categoryFilter}
                        onChange={(value) => setCategoryFilter(value || 'all')}
                    />
                </Group>
            </Paper>

            <Group grow>
                <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed">Total Birthdays</Text>
                    <Text size="xl" fw={700}>{birthdays.length}</Text>
                </Paper>
                <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed">Upcoming (Next 7 Days)</Text>
                    <Text size="xl" fw={700} c="orange">
                        {cleanBirthdays.filter(b => isUpcoming(b.birthDate)).length}
                    </Text>
                </Paper>
                <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed">This Month</Text>
                    <Text size="xl" fw={700} c="blue">
                        {cleanBirthdays.filter(b =>
                            dayjs(b.birthDate).month() === dayjs().month()
                        ).length}
                    </Text>
                </Paper>
            </Group>

            <Paper withBorder>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Birthday</Table.Th>
                            <Table.Th>Age</Table.Th>
                            <Table.Th>Next Birthday</Table.Th>
                            <Table.Th>Category</Table.Th>
                            <Table.Th>Contact</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredAndSortedBirthdays.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={7}>
                                    <Center py="xl">
                                        <Stack align="center" gap="sm">
                                            <Text size="lg" fw={500}>No birthdays found</Text>
                                            <Text c="dimmed" size="sm">
                                                {searchTerm || categoryFilter !== 'all'
                                                    ? 'Try adjusting your search or filter criteria'
                                                    : 'Start by adding your first birthday!'
                                                }
                                            </Text>
                                            {!searchTerm && categoryFilter === 'all' && (
                                                <Button
                                                    component={Link}
                                                    to="/birthdays/create"
                                                    leftSection={<IconPlus size={16} />}
                                                    size="sm"
                                                >
                                                    Add Birthday
                                                </Button>
                                            )}
                                        </Stack>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            filteredAndSortedBirthdays.map((birthday) => {
                                const daysUntil = getDaysUntilBirthday(birthday.birthDate?.toString() || '');
                                const age = getAge(birthday.birthDate?.toString() || '');

                                return (
                                    <Table.Tr key={birthday.id} style={{
                                        backgroundColor: isUpcoming(birthday.birthDate?.toString() || '') ? '#fff3e0' : undefined
                                    }}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Text fw={500}>{birthday.name}</Text>
                                                {isUpcoming(birthday.birthDate?.toString() || '') && (
                                                    <Badge color="orange" size="xs" variant="light">
                                                        Upcoming
                                                    </Badge>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {dayjs(birthday.birthDate).format('MMM D, YYYY')}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{age} years</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c={daysUntil <= 7 ? 'orange' : 'dimmed'}>
                                                {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={CATEGORY_COLORS[birthday.category]} size="sm">
                                                {CATEGORY_LABELS[birthday.category]}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">
                                                {birthday.email || birthday.phone || '—'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={() => navigate(`/birthdays/show/${birthday.id}`)}
                                                    title="View"
                                                >
                                                    <IconEye size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={() => navigate(`/birthdays/edit/${birthday.id}`)}
                                                    title="Edit"
                                                >
                                                    <IconEdit size={16} />
                                                </ActionIcon>
                                                <Menu shadow="md" width={200}>
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" size="sm">
                                                            <IconDotsVertical size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconCopy size={16} />}
                                                            onClick={() => navigate(`/birthdays/clone/${birthday.id}`)}
                                                        >
                                                            Clone
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<IconTrash size={16} />}
                                                            color="red"
                                                            onClick={() => handleDelete(birthday)}
                                                        >
                                                            Delete
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
