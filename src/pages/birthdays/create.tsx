import { useForm } from '@mantine/form';
import { useCreate, useGo } from '@refinedev/core';
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
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar, IconUser, IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import type { BirthdayFormData } from '../../types/models/birthdays/type';


export default function BirthdaysCreate() {
    const { mutate, isLoading } = useCreate();
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
                    message: 'Birthday created successfully!',
                    color: 'green',
                });
                go({
                    to: '/birthdays',
                    type: 'replace',
                });
            },
            onError: (error) => {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to create birthday. Please try again.',
                    color: 'red',
                });
            },
        });
    };

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
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="birthday-create-form"
                            type="submit"
                            loading={isLoading}
                            leftSection={<IconDeviceFloppy size={16} />}
                            size="sm"
                        >
                            Save Birthday
                        </Button>
                    </Group>
                </Group>

                {/* Birthday Card */}
                <Paper p="xl" withBorder>
                    <Stack gap="lg">
                        {/* Header Info */}
                        <div>
                            <Title order={1} mb="xs">Add New Birthday</Title>
                            <Text c="dimmed">
                                Add a new birthday to your dashboard to keep track of important dates
                            </Text>
                        </div>

                        {/* Form */}
                        <form id="birthday-create-form" onSubmit={form.onSubmit(handleSubmit)}>
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

                                {/* Contact Information */}
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

                                {/* Additional Information */}
                                <div>
                                    <Title order={3} mb="md">Additional Information</Title>
                                    <Textarea
                                        label="Notes"
                                        placeholder="Add any additional notes or reminders..."
                                        rows={3}
                                        {...form.getInputProps('notes')}
                                    />
                                </div>

                                {/* Birthday Preview */}
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