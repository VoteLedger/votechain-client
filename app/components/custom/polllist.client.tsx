import { getPolls } from "~/services/polls.client";
import { LoadingSpinner } from "../ui/loadingspinner";
import PollCard from "./pollcard";
import { BrowserProvider } from "ethers";
import useSWR from "swr";
import { useToast } from "~/hooks/use-toast.client";

interface PollListProps {
  provider: BrowserProvider;
}

export function PollList({ provider }: PollListProps) {
  const { toast } = useToast();
  const {
    data: polls,
    isLoading,
    isValidating,
    error,
  } = useSWR("polls", () => getPolls(provider));

  if (isLoading || isValidating) {
    return <LoadingSpinner />;
  }

  if (error || !polls) {
    return <div>Error loading polls: {JSON.stringify(error)}</div>;
  }

  return (
    <div>
      {/* Display a message if no polls are available */}
      {polls.length === 0 && !error && (
        <div className="p-4 bg-yellow-200 mx-4">
          <h2 className="text-xl font-bold">No Polls</h2>
          <p>There are no polls available at the moment.</p>
        </div>
      )}

      {/* Display each open poll's details */}
      {polls
        .filter((p) => !p.is_ended)
        .map((poll, idx) => (
          <PollCard
            key={idx}
            poll={poll}
            provider={provider}
            onVoteSuccess={() => {
              console.log("Vote");
              toast({
                title: "Poll vote recorded!",
                description:
                  "Your vote has been recorded successfully. Wait for the end of the poll to see the results.",
                duration: 5000,
              });
            }}
            onError={(msg) => {
              toast({
                title: "Error",
                description: msg,
                variant: "destructive",
                duration: 5000,
              });
            }}
          />
        ))}
    </div>
  );
}
