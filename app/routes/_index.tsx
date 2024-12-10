import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { getSession, isSession } from "~/lib/session";
import { CreatePollDialog } from "~/components/custom/createpolldialog.client";
import { Badge } from "~/components/ui/badge";
import { useEthContext } from "~/providers/ethcontextprovider.client";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast.client";
import { PollList } from "~/components/custom/polllist.client";
import { LoadingSpinner } from "~/components/ui/loadingspinner";
import { getPollCount } from "~/services/polls.client";
import useSWR from "swr";

export default function Index() {
  // Load the eth context
  const { accounts, connectWallet } = useEthContext();

  const { toast } = useToast();
  const { provider } = useEthContext();

  const { data, isLoading, isValidating, error } = useSWR(
    provider ? "poll_count" : null,
    () => getPollCount(provider!)
  );

  useEffect(() => {
    if (!accounts.length) {
      connectWallet();
    }
  }, [accounts.length, connectWallet]);

  return (
    <div className="container mx-auto mt-8">
      <div className="flex justify-between iterms-center">
        <div className="flex justify-left gap-x-2.5 items-center">
          <h1 className="text-3xl font-bold">Current Polls</h1>

          {/* Badge to show the total number of polls */}
          {!!data && <Badge>{data}</Badge>}
          {isLoading || (isValidating && <LoadingSpinner />)}
          {error && (
            <p className="text-red-500">
              An error occurred while fetching the poll count
            </p>
          )}
        </div>

        {/* Button to create a new poll */}
        <CreatePollDialog
          onPollCreated={() => {
            // Show a toast message
            toast({
              title: "Poll created",
              description: "The poll was created successfully.",
              variant: "default",
            });
          }}
        />
      </div>

      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4" />
      {provider ? <PollList provider={provider} /> : <LoadingSpinner />}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "VoteChain" },
    {
      name: "description",
      content: "VoteChain - A blockchain based voting system",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // First of all, fetch the session
  const session = await getSession(request.headers.get("Cookie"));

  if (!isSession(session)) {
    return redirect("/login");
  }
  return {};
};
