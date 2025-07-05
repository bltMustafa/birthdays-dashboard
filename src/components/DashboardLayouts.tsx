import { Box } from "@mantine/core";
import Sidebar from "./Sidebar";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        style={{
          marginLeft: '280px',
          flex: 1,
          backgroundColor: '#ffffff',
          minHeight: '100vh'
        }}
      >
        <Box p="xl">
          {children}
        </Box>
      </Box>
    </div>
  );
};