import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { getSession, isSession } from "~/lib/session";
import { CreatePollDialog } from "~/components/custom/createpolldialog";
import { Badge } from "~/components/ui/badge";
import { useEthContext } from "~/providers/ethcontextprovider";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast.client";
import { PollList } from "~/components/custom/polllist.client";
import { LoadingSpinner } from "~/components/ui/loadingspinner";
import { getPolls } from "~/services/polls.client";
import useSWR from "swr";
import { Poll } from "~/types/services";

interface PollCategories {
  myPolls: Poll[];
  availablePolls: Poll[];
  closedPolls: Poll[];
}

export default function Index() {
  // Load the eth context
  const { accounts, connectWallet } = useEthContext();

  const { toast } = useToast();
  const { provider } = useEthContext();

  const { data: polls, ...swr_polls_status } = useSWR(
    provider ? "polls" : null,
    () => getPolls(provider!)
  );

  useEffect(() => {
    if (!accounts.length) {
      connectWallet();
    }
  }, [accounts.length, connectWallet]);

  // Assuming you have access to 'accounts' and it's an array of strings (addresses)
  const currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;

  // Initialize the accumulator with the defined type
  const initialCategories: PollCategories = {
    myPolls: [],
    availablePolls: [],
    closedPolls: [],
  };

  // Categorize the polls using reduce with explicit typing
  const { myPolls, availablePolls, closedPolls }: PollCategories = (
    polls || []
  ).reduce<PollCategories>((acc, poll) => {
    // Ensure poll.owner and currentAccount are defined and are strings
    if (
      currentAccount &&
      poll.owner.toLowerCase() === currentAccount.toLowerCase() &&
      !poll.is_ended
    ) {
      acc.myPolls.push(poll);
    } else if (poll.is_ended || poll.end_time.getTime() < Date.now()) {
      acc.closedPolls.push(poll);
    } else {
      acc.availablePolls.push(poll);
    }
    return acc;
  }, initialCategories);

  return (
    <div className="container mx-auto mt-8 mb-10">
      {/* Display my polls */}
      <div className="flex justify-between gap-x-2.5 items-center my-4">
        <div className="flex justify-left gap-x-2.5 items-center">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <div className="flex gap-x-2.5 items-center">
            {/* Badge to show the total number of polls */}
            <Badge>{!!polls && "Total Polls: " + myPolls.length}</Badge>
          </div>
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
          onError={(error) => {
            toast({
              title: "Error",
              description: error,
              variant: "destructive",
            });
          }}
        />
      </div>

      <div className="border-b-2 border-gray-300 my-4" />
      {provider ? (
        <PollList
          polls={myPolls}
          provider={provider}
          isLoading={swr_polls_status.isLoading}
          isValidating={swr_polls_status.isValidating}
          error={swr_polls_status.error}
          showEndButton={true}
          alert={{
            title: "You have no polls",
            message: "Create a new poll by clicking the button above.",
            bg: "bg-blue-200",
          }}
        />
      ) : (
        <LoadingSpinner />
      )}

      {/* Display available polls */}
      <div className="flex justify-left gap-x-2.5 items-center my-4">
        <div className="flex justify-between gap-x-2.5 items-center">
          <h1 className="text-3xl font-bold">Available polls</h1>
          <div className="flex gap-x-2.5 items-center">
            {/* Badge to show the total number of polls */}
            <Badge>{!!polls && "Total Polls: " + availablePolls.length}</Badge>
          </div>
        </div>
      </div>

      <div className="border-b-2 border-gray-300 my-4" />
      {provider ? (
        <PollList
          polls={availablePolls}
          provider={provider}
          isLoading={swr_polls_status.isLoading}
          isValidating={swr_polls_status.isValidating}
          error={swr_polls_status.error}
          alert={{
            title: "No Polls",
            message:
              "There are no polls available at the moment. Wait for the owner to create one (or create one yourself!).",
            bg: "bg-yellow-200",
          }}
        />
      ) : (
        <LoadingSpinner />
      )}

      {/* Display my polls */}
      {closedPolls.length > 0 && (
        <>
          <div className="flex justify-left gap-x-2.5 items-center my-4">
            <div className="flex justify-between gap-x-2.5 items-center">
              <h1 className="text-3xl font-bold">Closed Polls</h1>
              <div className="flex gap-x-2.5 items-center">
                {/* Badge to show the total number of polls */}
                <Badge>{!!polls && "Total Polls: " + closedPolls.length}</Badge>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-gray-300 my-4" />
          {provider ? (
            <PollList
              polls={closedPolls}
              provider={provider}
              isLoading={swr_polls_status.isLoading}
              isValidating={swr_polls_status.isValidating}
              error={swr_polls_status.error}
              alert={{
                title: "There are no closed polls",
                message: "Come back later to see the results!",
                bg: "bg-green-200",
              }}
            />
          ) : (
            <LoadingSpinner />
          )}
        </>
      )}
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
