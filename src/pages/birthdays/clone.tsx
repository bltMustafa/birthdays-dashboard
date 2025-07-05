import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useCreate, useOne, useGo } from '@refinedev/core';
import {
    Container,
    Title,
    Text,
    Group,
    Stack,
    TextInput,
    Select,
    Button,
    Paper,
    Alert,
    Textarea,
    Loader,
    Center,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar, IconUser, IconArrowLeft, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';


import type { BirthdayFormData } from '../../types/models/birthdays/type';


export default function BirthdaysClone() {
    const { id } = useParams<{ id: string }>();
    const { mutate, isLoading: isCreateLoading } = useCreate();
    const { data, isLoading, error } = useOne({
        resource: 'birthdays',
        id: id!,
    });
    const go = useGo();

    const form = useForm<BirthdayFormData>({
        initialValues: {
            name: '',
            birthDate: null,
            category: 'friends',
            email: '',
            phone: '',
            notes: '',
        },
        validate: {
            name: (value) => (value.trim().length < 2 ? 'Name must be at least 2 characters' : null),
            birthDate: (value) => {
                if (!value) return 'Birth date is required';
                if (dayjs(value).isAfter(dayjs())) return 'Birth date cannot be in the future';
                if (dayjs(value).isBefore(dayjs('1900-01-01'))) return 'Birth date must be after 1900';
                return null;
            },
            email: (value) => {
                if (value && !/^\S+@\S+\.\S+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                return null;
            },
            phone: (value) => {
                if (value && !/^[\d\s\-\+\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
                    return 'Please enter a valid phone number';
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (data?.data) {
            form.setValues({
                name: `${data.data.name} (Copy)`,
                birthDate: data.data.birthDate ? new Date(data.data.birthDate) : null,
                category: data.data.category || 'friends',
                email: data.data.email || '',
                phone: data.data.phone || '',
                notes: data.data.notes || '',
            });
        }
    }, [data]);

    const handleSubmit = (values: BirthdayFormData) => {
        mutate({
            resource: 'birthdays',
            values: {
                ...values,
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
            },
        }, {
            onSuccess: () => {
                notifications.show({
                    title: 'Success',
                    message: 'Birthday cloned successfully!',
                    color: 'green',
                });
                go({
                    to: '/birthdays',
                    type: 'replace',
                });
            },
            onError: (err: any) => {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to clone birthday. Please try again.',
                    color: 'red',
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
            <Container>
                <Alert color="red" title="Error">
                    Failed to load birthday data. Please try again later.
                </Alert>
            </Container>
        );
    }

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
                            to="/birthdays"
                            variant="subtle"
                            leftSection={<IconX size={16} />}
                            size="sm"
                            disabled={isCreateLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="birthday-clone-form"
                            type="submit"
                            loading={isCreateLoading}
                            leftSection={<IconDeviceFloppy size={16} />}
                            size="sm"
                        >
                            Clone Birthday
                        </Button>
                    </Group>
                </Group>

                {/* Birthday Card */}
                <Paper p="xl" withBorder>
                    <Stack gap="lg">
                        {/* Header Info */}
                        <div>
                            <Title order={1} mb="xs">Clone Birthday</Title>
                            <Text c="dimmed">
                                Create a new birthday based on {data?.data?.name}'s information
                            </Text>
                        </div>

                        {/* Clone Info Alert */}
                        <Alert color="blue" title="Cloning Birthday">
                            <Text size="sm">
                                You're creating a new birthday based on <strong>{data?.data?.name}</strong>'s information.
                                All fields have been pre-filled, but you can modify them as needed.
                            </Text>
                        </Alert>

                        {/* Form */}
                        <form id="birthday-clone-form" onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="lg">
                                {/* Basic Information */}
                                <div>
                                    <Title order={3} mb="md">Basic Information</Title>
                                    <Stack gap="md">
                                        <TextInput
                                            label="Full Name"
                                            placeholder="Enter full name"
                                            withAsterisk
                                            leftSection={<IconUser size={16} />}
                                            {...form.getInputProps('name')}
                                        />

                                        <DateInput
                                            label="Birth Date"
                                            placeholder="Select birth date"
                                            withAsterisk
                                            leftSection={<IconCalendar size={16} />}
                                            maxDate={new Date()}
                                            {...form.getInputProps('birthDate')}
                                        />

                                        <Select
                                            label="Category"
                                            placeholder="Select category"
                                            withAsterisk
                                            data={[
                                                { value: 'family', label: 'Family' },
                                                { value: 'friends', label: 'Friends' },
                                                { value: 'colleagues', label: 'Colleagues' },
                                                { value: 'other', label: 'Other' },
                                            ]}
                                            {...form.getInputProps('category')}
                                        />
                                    </Stack>
                                </div>

                                <div>
                                    <Title order={3} mb="md">Contact Information (Optional)</Title>
                                    <Stack gap="md">
                                        <TextInput
                                            label="Email Address"
                                            placeholder="Enter email address"
                                            type="email"
                                            {...form.getInputProps('email')}
                                        />

                                        <TextInput
                                            label="Phone Number"
                                            placeholder="Enter phone number"
                                            {...form.getInputProps('phone')}
                                        />
                                    </Stack>
                                </div>

                                <div>
                                    <Title order={3} mb="md">Additional Information</Title>
                                    <Textarea
                                        label="Notes"
                                        placeholder="Add any additional notes or reminders..."
                                        rows={3}
                                        {...form.getInputProps('notes')}
                                    />
                                </div>

                                {form.values.birthDate && (
                                    <Alert color="blue" title="Birthday Preview">
                                        <Group>
                                            <div>
                                                <Text size="sm">
                                                    <strong>Age:</strong> {dayjs().diff(dayjs(form.values.birthDate), 'year')} years old
                                                </Text>
                                                <Text size="sm">
                                                    <strong>Next Birthday:</strong> {(() => {
                                                        const today = dayjs();
                                                        const currentYear = today.year();
                                                        let nextBirthday = dayjs(form.values.birthDate).year(currentYear);

                                                        if (nextBirthday.isBefore(today, 'day')) {
                                                            nextBirthday = nextBirthday.year(currentYear + 1);
                                                        }

                                                        const daysUntil = nextBirthday.diff(today, 'day');
                                                        return daysUntil === 0 ? 'Today!' : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
                                                    })()}
                                                </Text>
                                            </div>
                                        </Group>
                                    </Alert>
                                )}
                            </Stack>
                        </form>
                    </Stack>
                </Paper>

                {/* Quick Actions */}
                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <Text fw={500}>Quick Actions</Text>
                        <Group>
                            <Button
                                component={Link}
                                to="/birthdays"
                                variant="subtle"
                                size="sm"
                                leftSection={<IconArrowLeft size={16} />}
                            >
                                Back to List
                            </Button>
                        </Group>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
}