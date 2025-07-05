import React, { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useUpdate, useOne, useGo } from '@refinedev/core';
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
    Badge,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    IconCalendar,
    IconUser,
    IconArrowLeft,
    IconDeviceFloppy,
    IconX,
    IconCopy,
    IconInfoCircle,
} from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';


import type { BirthdayFormData } from '../../types/models/birthdays/type';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/constant';


export default function BirthdaysEdit() {
    const { id } = useParams<{ id: string }>();
    const { mutate, isLoading: isUpdateLoading } = useUpdate();
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
                name: data.data.name || '',
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
            id: id!,
            values: {
                ...values,
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
            },
        }, {
            onSuccess: () => {
                notifications.show({
                    title: 'Success',
                    message: 'Birthday updated successfully!',
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
                    message: 'Failed to update birthday. Please try again.',
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

    const birthday = data?.data;

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
                            to={`/birthdays/clone/${id}`}
                            variant="light"
                            leftSection={<IconCopy size={16} />}
                            size="sm"
                        >
                            Clone
                        </Button>
                        <Button
                            component={Link}
                            to="/birthdays"
                            variant="subtle"
                            leftSection={<IconX size={16} />}
                            size="sm"
                            disabled={isUpdateLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="birthday-edit-form"
                            type="submit"
                            loading={isUpdateLoading}
                            leftSection={<IconDeviceFloppy size={16} />}
                            size="sm"
                        >
                            Save Changes
                        </Button>
                    </Group>
                </Group>

                {/* Birthday Card */}
                <Paper p="xl" withBorder>
                    <Stack gap="lg">
                        {/* Header Info */}
                        <div>
                            <Group mb="xs">
                                <Title order={1}>Edit Birthday</Title>
                                {birthday && (
                                    <Badge color={CATEGORY_COLORS[birthday.category as keyof typeof CATEGORY_COLORS]} size="lg">
                                        {CATEGORY_LABELS[birthday.category as keyof typeof CATEGORY_LABELS]}
                                    </Badge>
                                )}
                            </Group>
                            <Text c="dimmed">
                                Update {birthday?.name}'s birthday information
                            </Text>
                        </div>

                        {/* Current Info Alert */}
                        {birthday && (
                            <Alert color="blue" title="Current Information">
                                <Group>
                                    <div>
                                        <Text size="sm">
                                            <strong>Current Age:</strong> {dayjs().diff(dayjs(birthday.birthDate), 'year')} years old
                                        </Text>
                                        <Text size="sm">
                                            <strong>Born:</strong> {dayjs(birthday.birthDate).format('MMMM D, YYYY')}
                                        </Text>
                                    </div>
                                </Group>
                            </Alert>
                        )}

                        {/* Form */}
                        <form id="birthday-edit-form" onSubmit={form.onSubmit(handleSubmit)}>
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
                                                    <strong>New Age:</strong> {dayjs().diff(dayjs(form.values.birthDate), 'year')} years old
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
                                to={`/birthdays/show/${id}`}
                                variant="subtle"
                                size="sm"
                                leftSection={<IconInfoCircle size={16} />}
                            >
                                View Details
                            </Button>
                            <Button
                                component={Link}
                                to={`/birthdays/clone/${id}`}
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