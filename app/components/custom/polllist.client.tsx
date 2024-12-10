import { getPolls } from "~/services/polls.client";
import { LoadingSpinner } from "../ui/loadingspinner";
import PollCard from "./pollcard";
import { BrowserProvider } from "ethers";
import useSWR from "swr";

interface PollListProps {
  provider: BrowserProvider;
}

export function PollList({ provider }: PollListProps) {
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
    return <div>Error loading polls</div>;
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

      {/* Display each poll's details */}
      {polls.map((poll, idx) => (
        <PollCard
          key={idx}
          poll={poll}
          onVote={() => {
            console.log("Vote");
          }}
          onViewDetails={() => {
            console.log("View details");
          }}
        />
      ))}
    </div>
  );
}
