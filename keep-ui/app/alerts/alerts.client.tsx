"use client";
import {
  MultiSelect,
  MultiSelectItem,
  Flex,
  Button,
  Callout,
  TabGroup,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@tremor/react";
import { Alert } from "./models";
import {
  ArchiveBoxIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import "./alerts.client.css";
import { useState } from "react";
import { getApiURL } from "../../utils/apiUrl";
import { useSession } from "../../utils/customAuth";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";
import Loading from "../loading";
import { BellAlertIcon, ServerStackIcon } from "@heroicons/react/24/outline";
import { AlertTable } from "./alert-table";
import { onlyUnique } from "../../utils/helpers";

export default function AlertsPage() {
  const apiUrl = getApiURL();
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const { data: session, status, update } = useSession();
  const { data, error, isLoading } = useSWR<Alert[]>(
    `${apiUrl}/alerts`,
    (url) => fetcher(url, session?.accessToken!)
  );

  if (error) {
    return (
      <Callout
        className="mt-4"
        title="Error"
        icon={ExclamationCircleIcon}
        color="rose"
      >
        Failed to load alerts
      </Callout>
    );
  }
  if (status === "loading" || isLoading || !data) return <Loading />;
  if (status === "unauthenticated") return <div>Unauthenticated...</div>;

  const environments = data
    .map((alert) => alert.environment)
    .filter(onlyUnique);

  function environmentIsSeleected(alert: Alert): boolean {
    return (
      selectedEnvironments.includes(alert.environment) ||
      selectedEnvironments.length === 0
    );
  }

  const statuses = data.map((alert) => alert.status).filter(onlyUnique);

  function statusIsSeleected(alert: Alert): boolean {
    return selectedStatus.includes(alert.status) || selectedStatus.length === 0;
  }

  return (
    <>
      <Flex justifyContent="between">
        <div className="flex w-full">
          <MultiSelect
            onValueChange={setSelectedEnvironments}
            placeholder="Select Environment..."
            className="max-w-xs mb-5"
            icon={ServerStackIcon}
          >
            {environments!.map((item) => (
              <MultiSelectItem key={item} value={item}>
                {item}
              </MultiSelectItem>
            ))}
          </MultiSelect>
          <MultiSelect
            onValueChange={setSelectedStatus}
            placeholder="Select Status..."
            className="max-w-xs mb-5 ml-2.5"
            icon={BellAlertIcon}
          >
            {statuses!.map((item) => (
              <MultiSelectItem key={item} value={item}>
                {item}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </div>
        <Button
          icon={ArchiveBoxIcon}
          color="orange"
          size="xs"
          disabled={true}
          title="Coming Soon"
        >
          Export
        </Button>
      </Flex>
      <TabGroup>
        <TabList>
          <Tab>Pushed to Keep</Tab>
          <Tab>Pulled from Providers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AlertTable
              data={data.filter(
                (alert) =>
                  alert.pushed &&
                  environmentIsSeleected(alert) &&
                  statusIsSeleected(alert)
              )}
              groupBy="name"
              pushed={true}
            />
          </TabPanel>
          <TabPanel>
            <AlertTable
              data={data.filter(
                (alert) =>
                  !alert.pushed &&
                  environmentIsSeleected(alert) &&
                  statusIsSeleected(alert)
              )}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
