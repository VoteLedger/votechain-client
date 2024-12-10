import { LoadingSpinner } from "../ui/loadingspinner";
import PollCard from "./pollcard";
import { BrowserProvider } from "ethers";
import { useToast } from "~/hooks/use-toast.client";
import { useCallback } from "react";
import { Poll } from "~/types/services";
import { cn } from "~/lib/utils";

interface AlertProps {
  title: string;
  message: string;
  bg: string;
}

interface PollListProps {
  provider: BrowserProvider;
  polls: Poll[];
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  alert?: AlertProps;
}

export function PollList({
  provider,
  polls,
  isLoading,
  isValidating,
  error,
  alert = {
    title: "No Polls",
    message: "There are no polls available at the moment.",
    bg: "bg-yellow-200",
  },
}: PollListProps) {
  const { toast } = useToast();

  // callback with sorted + filtered polls
  const sortedPolls = useCallback(() => {
    return (polls || [])
      .sort((a, b) => {
        return a.end_time.getTime() - b.end_time.getTime();
      })
      .filter((p) => !p.is_ended);
  }, [polls]);

  if (isLoading || isValidating) {
    return <LoadingSpinner />;
  }

  if (error || !polls) {
    return (
      <div>
        Error loading polls:{" "}
        {JSON.stringify(error, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Display a message if no polls are available */}
      {polls.length === 0 && !error && (
        <div className={cn("p-4 mx-4", alert.bg)}>
          <h2 className="text-xl font-bold">{alert.title}</h2>
          <p>{alert.message}</p>
        </div>
      )}

      {/* Display each open poll's details */}
      {sortedPolls().map((poll, idx) => (
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
