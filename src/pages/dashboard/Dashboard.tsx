import { useList } from '@refinedev/core';
import {
    Title,
    Text,
    Group,
    Badge,
    Stack,
    Paper,
    Grid,
    Card,
    Loader,
    Center,
    Alert,
    Box,
    Button,
    SimpleGrid,
    Progress,
} from '@mantine/core';
import {
    IconCalendar,
    IconCake,
    IconUsers,
    IconTrendingUp,
    IconGift,
    IconArrowRight,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Birthday } from '../../types/models/birthdays/type';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/constant';



export default function Dashboard() {
    const { data, isLoading, error } = useList<Birthday>({
        resource: 'birthdays',
        pagination: { mode: 'off' },
    });

    const birthdays = data?.data || [];

    // Calculate days until next birthday
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

    const upcomingBirthdays = birthdays
        .filter(b => isUpcoming(b.birthDate?.toString() || ''))
        .sort((a, b) => getDaysUntilBirthday(a.birthDate?.toString() || '') - getDaysUntilBirthday(b.birthDate?.toString() || ''))
        .slice(0, 5);

    const thisMonthBirthdays = birthdays.filter(b =>
        dayjs(b.birthDate).month() === dayjs().month()
    );

    const categoryStats = {
        family: birthdays.filter(b => b.category === 'family').length,
        friends: birthdays.filter(b => b.category === 'friends').length,
        colleagues: birthdays.filter(b => b.category === 'colleagues').length,
        other: birthdays.filter(b => b.category === 'other').length,
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
                Failed to load dashboard data. Please try again later.
            </Alert>
        );
    }

    return (
        <Stack gap="lg">
            {/* Header */}
            <Box>
                <Title order={1} mb="xs">Dashboard</Title>
                <Text c="dimmed" size="sm">
                    Welcome back! Here's an overview of your birthday management.
                </Text>
            </Box>

            {/* Quick Stats */}
            <SimpleGrid cols={4} spacing="md">
                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">Total Birthdays</Text>
                            <Text size="xl" fw={700}>{birthdays.length}</Text>
                        </div>
                        <IconUsers size={32} color="#228be6" />
                    </Group>
                </Paper>

                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">Upcoming (7 Days)</Text>
                            <Text size="xl" fw={700} c="orange">{upcomingBirthdays.length}</Text>
                        </div>
                        <IconCake size={32} color="#fd7e14" />
                    </Group>
                </Paper>

                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">This Month</Text>
                            <Text size="xl" fw={700} c="blue">{thisMonthBirthdays.length}</Text>
                        </div>
                        <IconCalendar size={32} color="#228be6" />
                    </Group>
                </Paper>

                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c="dimmed">Categories</Text>
                            <Text size="xl" fw={700} c="green">4</Text>
                        </div>
                        <IconTrendingUp size={32} color="#51cf66" />
                    </Group>
                </Paper>
            </SimpleGrid>

            <Grid>
                {/* Upcoming Birthdays */}
                <Grid.Col span={8}>
                    <Paper p="lg" withBorder>
                        <Group justify="space-between" mb="md">
                            <Title order={3}>Upcoming Birthdays</Title>
                            <Button
                                variant="subtle"
                                size="sm"
                                component={Link}
                                to="/birthdays"
                                rightSection={<IconArrowRight size={16} />}
                            >
                                View All
                            </Button>
                        </Group>

                        {upcomingBirthdays.length === 0 ? (
                            <Box ta="center" py="xl">
                                <IconGift size={48} color="gray" />
                                <Text size="lg" fw={500} mt="md">No upcoming birthdays</Text>
                                <Text c="dimmed" size="sm">
                                    All clear for the next 7 days!
                                </Text>
                            </Box>
                        ) : (
                            <Stack gap="sm">
                                {upcomingBirthdays.map((birthday) => {
                                    const daysUntil = getDaysUntilBirthday(birthday.birthDate?.toString() || '');
                                    const age = getAge(birthday.birthDate?.toString() || '');

                                    return (
                                        <Card key={birthday.id} withBorder p="md">
                                            <Group justify="space-between">
                                                <Box>
                                                    <Group gap="sm" mb="xs">
                                                        <Text fw={600}>{birthday.name}</Text>
                                                        <Badge color={CATEGORY_COLORS[birthday.category]} size="sm">
                                                            {CATEGORY_LABELS[birthday.category]}
                                                        </Badge>
                                                        <Badge color="orange" variant="light" size="sm">
                                                            {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                                                        </Badge>
                                                    </Group>
                                                    <Text size="sm" c="dimmed">
                                                        {dayjs(birthday.birthDate).format('MMMM D, YYYY')} • Turning {age + 1}
                                                    </Text>
                                                </Box>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    component={Link}
                                                    to={`/birthdays/show/${birthday.id}`}
                                                >
                                                    View
                                                </Button>
                                            </Group>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>

                {/* Category Breakdown */}
                <Grid.Col span={4}>
                    <Paper p="lg" withBorder>
                        <Title order={3} mb="md">Category Breakdown</Title>
                        <Stack gap="md">
                            {Object.entries(categoryStats).map(([category, count]) => (
                                <Box key={category}>
                                    <Group justify="space-between" mb="xs">
                                        <Text size="sm" fw={500}>
                                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                                        </Text>
                                        <Text size="sm" c="dimmed">{count}</Text>
                                    </Group>
                                    <Progress
                                        value={birthdays.length > 0 ? (count / birthdays.length) * 100 : 0}
                                        color={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                                        size="sm"
                                    />
                                </Box>
                            ))}
                        </Stack>

                        <Button
                            variant="light"
                            fullWidth
                            mt="md"
                            component={Link}
                            to="/birthdays/create"
                            leftSection={<IconCake size={16} />}
                        >
                            Add Birthday
                        </Button>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Quick Actions */}
            <Paper p="lg" withBorder>
                <Title order={3} mb="md">Quick Actions</Title>
                <SimpleGrid cols={3} spacing="md">
                    <Card withBorder p="md" component={Link} to="/birthdays/create" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Center>
                            <Stack align="center" gap="sm">
                                <IconCake size={32} color="#fd7e14" />
                                <Text fw={500}>Add Birthday</Text>
                                <Text size="sm" c="dimmed" ta="center">Create a new birthday entry</Text>
                            </Stack>
                        </Center>
                    </Card>

                    <Card withBorder p="md" component={Link} to="/birthdays" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Center>
                            <Stack align="center" gap="sm">
                                <IconCalendar size={32} color="#228be6" />
                                <Text fw={500}>View All Birthdays</Text>
                                <Text size="sm" c="dimmed" ta="center">Browse all birthday entries</Text>
                            </Stack>
                        </Center>
                    </Card>

                    <Card withBorder p="md" component={Link} to="/friends" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Center>
                            <Stack align="center" gap="sm">
                                <IconUsers size={32} color="#51cf66" />
                                <Text fw={500}>Manage Friends</Text>
                                <Text size="sm" c="dimmed" ta="center">Coming soon...</Text>
                            </Stack>
                        </Center>
                    </Card>
                </SimpleGrid>
            </Paper>
        </Stack>
    );
} 