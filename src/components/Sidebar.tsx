import { NavLink, Group, Text, Stack, Box } from '@mantine/core';
import {
    IconUsers,
    IconCake,
    IconCalendar,
    IconHeart,
    IconHome
} from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }: SidebarProps) => {
    const location = useLocation();

    const navigationItems = [
        {
            icon: IconHome,
            label: 'Dashboard',
            href: '/',
            color: 'blue',
        },
        {
            icon: IconCake,
            label: 'Birthdays',
            href: '/birthdays',
            color: 'red',
        },
        {
            icon: IconUsers,
            label: 'Friends',
            href: '/friends',
            color: 'green',
        },
    ];

    return (
        <Box
            style={{
                height: '100vh',
                width: '280px',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #e9ecef',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Group p="xl" style={{ borderBottom: '1px solid #e9ecef' }}>
                <IconCalendar size={28} color="red" />
                <Text size="xl" fw={700} c="red">
                    Birthday Manager
                </Text>
            </Group>

            {/* Navigation */}
            <Stack gap="xs" p="md" style={{ flex: 1 }}>
                {navigationItems.map((item) => (
                    <NavLink
                        key={item.href}
                        component={Link}
                        to={item.href}
                        label={item.label}
                        leftSection={<item.icon size={20} />}
                        active={location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))}
                        variant="filled"
                        color={item.color}
                        onClick={onClose}
                        style={{
                            borderRadius: '8px',
                            marginBottom: '4px',
                        }}
                    />
                ))}
            </Stack>

            <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
                <Group>
                    <IconHeart size={16} color="#fd7e14" />
                    <Text size="sm" c="dimmed">
                        Atakan götünü sikeym
                    </Text>
                </Group>
            </Box>
        </Box>
    );
};

export default Sidebar; 