import React from "react";
import { Refine } from "@refinedev/core";
import routerBindings, { UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";


import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import * as BR from "./pages/birthdays";
import * as DS from "./pages/dashboard";

import { ModalsProvider } from "@mantine/modals";

import mockDataProvider from "./utilities/mockDataProvider";
import DashboardLayout from "./components/DashboardLayouts";

const AppContent: React.FC = () => {
  return (
    <Refine
      routerProvider={routerBindings}
      dataProvider={mockDataProvider}
      resources={[
        {
          name: "birthdays",
          list: "/birthdays",
          create: "/birthdays/create",
          edit: "/birthdays/edit/:id",
          show: "/birthdays/show/:id",
          clone: "/birthdays/clone/:id",
          meta: {
            label: "Birthdays",
          },
        },
      ]}
      options={{
        disableTelemetry: true,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <Routes>
        <Route path="/" element={
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        }>
          <Route index element={<DS.Dashboard />} />
          <Route path="birthdays">
            <Route index element={<BR.BirthdayList />} />
            <Route path="create" element={<BR.BirthdayCreate />} />
            <Route path="edit/:id" element={<BR.BirthdayEdit />} />
            <Route path="show/:id" element={<BR.BirthdayShow />} />
            <Route path="clone/:id" element={<BR.BirthdayClone />} />
          </Route>
        </Route>
      </Routes>
      <UnsavedChangesNotifier />
    </Refine>
  );
};

const App: React.FC = () => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;
