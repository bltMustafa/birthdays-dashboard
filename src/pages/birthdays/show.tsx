import { useOne, useDelete, useGo } from '@refinedev/core';
import {
    Container,
    Title,
    Text,
    Group,
    Stack,
    Badge,
    Button,
    Paper,
    Alert,
    Loader,
    Center,
    Divider,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconEdit,
    IconTrash,
    IconCalendar,
    IconMail,
    IconPhone,
    IconNote,
    IconCake,
    IconCopy,
} from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';
import type { Birthday } from '../../types/models/birthdays/type';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/constant';


export default function BirthdaysShow() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, error } = useOne<Birthday>({
        resource: 'birthdays',
        id: id!,
    });
    const { mutate: deleteBirthday, isLoading: isDeleteLoading } = useDelete();
    const go = useGo();

    const birthday = data?.data;
    const getDaysUntilBirthday = (birthDate: string) => {
        const today = dayjs();
        const currentYear = today.year();
        let nextBirthday = dayjs(birthDate).year(currentYear);

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

    const handleDelete = () => {
        modals.openConfirmModal({
            title: 'Delete Birthday',
            children: (
                <Text>
                    Are you sure you want to delete <strong>{birthday?.name}</strong>'s birthday?
                    This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteBirthday({
                    resource: 'birthdays',
                    id: id!,
                }, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Success',
                            message: 'Birthday deleted successfully!',
                            color: 'green',
                        });
                        go({
                            to: '/birthdays',
                            type: 'replace',
                        });
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

    if (error || !birthday) {
        return (
            <Container>
                <Alert color="red" title="Error">
                    Failed to load birthday data. Please try again later.
                </Alert>
            </Container>
        );
    }

    const daysUntil = getDaysUntilBirthday(birthday.birthDate?.toString() || '');
    const age = getAge(birthday.birthDate?.toString() || '');

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <Button
                        component={Link}
                        to="/birthdays"
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                        size="sm"
                    >
                        Back to Birthdays
                    </Button>

                    <Group gap="sm">
                        <Button
                            component={Link}
                            to={`/birthdays/clone/${birthday.id}`}
                            variant="light"
                            leftSection={<IconCopy size={16} />}
                            size="sm"
                        >
                            Clone
                        </Button>
                        <Button
                            component={Link}
                            to={`/birthdays/edit/${birthday.id}`}
                            leftSection={<IconEdit size={16} />}
                            size="sm"
                        >
                            Edit
                        </Button>
                        <Button
                            color="red"
                            variant="light"
                            leftSection={<IconTrash size={16} />}
                            size="sm"
                            onClick={handleDelete}
                            loading={isDeleteLoading}
                        >
                            Delete
                        </Button>
                    </Group>
                </Group>

                {/* Birthday Card */}
                <Paper p="xl" withBorder>
                    <Stack gap="lg">
                        {/* Header Info */}
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Group mb="xs">
                                    <Title order={1}>{birthday.name}</Title>
                                    <Badge color={CATEGORY_COLORS[birthday.category]} size="lg">
                                        {CATEGORY_LABELS[birthday.category]}
                                    </Badge>
                                    {isUpcoming(birthday.birthDate?.toString() || '') && (
                                        <Badge color="orange" variant="light" size="lg">
                                            Upcoming!
                                        </Badge>
                                    )}
                                </Group>
                                <Text c="dimmed">
                                    {dayjs(birthday.birthDate).format('MMMM D, YYYY')}
                                </Text>
                            </div>

                            <Stack align="center" gap="xs">
                                <IconCake size={48} color={isUpcoming(birthday.birthDate?.toString() || '') ? '#fd7e14' : '#228be6'} />
                                <Text fw={700} size="lg" ta="center">
                                    {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                                </Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    until birthday
                                </Text>
                            </Stack>
                        </Group>

                        <Divider />

                        {/* Birthday Stats */}
                        <Group grow>
                            <Paper p="md" withBorder>
                                <Group>
                                    <IconCalendar size={24} color="blue" />
                                    <div>
                                        <Text fw={500}>Current Age</Text>
                                        <Text size="xl" fw={700}>{age} years old</Text>
                                    </div>
                                </Group>
                            </Paper>
                            <Paper p="md" withBorder>
                                <Group>
                                    <IconCake size={24} color="green" />
                                    <div>
                                        <Text fw={500}>Next Birthday</Text>
                                        <Text size="xl" fw={700}>
                                            {age + 1} years old
                                        </Text>
                                    </div>
                                </Group>
                            </Paper>
                        </Group>

                        {/* Contact Information */}
                        {(birthday.email || birthday.phone) && (
                            <div>
                                <Title order={3} mb="md">Contact Information</Title>
                                <Stack gap="md">
                                    {birthday.email && (
                                        <Group>
                                            <IconMail size={20} color="gray" />
                                            <div>
                                                <Text fw={500}>Email</Text>
                                                <Text c="dimmed">{birthday.email}</Text>
                                            </div>
                                        </Group>
                                    )}
                                    {birthday.phone && (
                                        <Group>
                                            <IconPhone size={20} color="gray" />
                                            <div>
                                                <Text fw={500}>Phone</Text>
                                                <Text c="dimmed">{birthday.phone}</Text>
                                            </div>
                                        </Group>
                                    )}
                                </Stack>
                            </div>
                        )}

                        {/* Notes */}
                        {birthday.notes && (
                            <div>
                                <Title order={3} mb="md">Notes</Title>
                                <Paper p="md" withBorder bg="gray.0">
                                    <Group align="flex-start">
                                        <IconNote size={20} color="gray" />
                                        <Text style={{ flex: 1 }}>{birthday.notes}</Text>
                                    </Group>
                                </Paper>
                            </div>
                        )}

                        {/* Birthday Timeline */}
                        <div>
                            <Title order={3} mb="md">Birthday Timeline</Title>
                            <Paper p="md" withBorder>
                                <Stack gap="sm">
                                    <Group>
                                        <Text fw={500}>Born:</Text>
                                        <Text>{dayjs(birthday.birthDate).format('MMMM D, YYYY')}</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500}>Days since birth:</Text>
                                        <Text>{dayjs().diff(dayjs(birthday.birthDate), 'day')} days</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500}>Next milestone:</Text>
                                        <Text>
                                            {(() => {
                                                const nextMilestone = Math.ceil((age + 1) / 10) * 10;
                                                const yearsToMilestone = nextMilestone - age;
                                                return yearsToMilestone === 1
                                                    ? `${nextMilestone} years old (next year!)`
                                                    : `${nextMilestone} years old (in ${yearsToMilestone} years)`;
                                            })()}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Paper>
                        </div>
                    </Stack>
                </Paper>

                {/* Quick Actions */}
                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <Text fw={500}>Quick Actions</Text>
                        <Group>
                            <Button
                                component={Link}
                                to={`/birthdays/edit/${birthday.id}`}
                                variant="subtle"
                                size="sm"
                                leftSection={<IconEdit size={16} />}
                            >
                                Edit Birthday
                            </Button>
                            <Button
                                component={Link}
                                to={`/birthdays/clone/${birthday.id}`}
                                variant="subtle"
                                size="sm"
                                leftSection={<IconCopy size={16} />}
                            >
                                Clone Birthday
                            </Button>
                        </Group>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
}