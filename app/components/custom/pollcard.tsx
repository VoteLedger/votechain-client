// components/PollCard.tsx
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Poll } from "~/types/services";
import {
  FaInfoCircle,
  FaCrown,
  FaClock,
  FaPoll,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog"; // Ensure you have a Dialog component
import { cn } from "~/lib/utils";
import { LoadingSpinner } from "../ui/loadingspinner";
import { BrowserProvider } from "ethers";
import { castVote } from "~/services/polls.client";
import { useSWRConfig } from "swr";
import { ErrorDecoder } from "ethers-decode-error";
import Countdown from "../ui/countdown";

const DEFAULT_VOTING_ERROR_MESSAGE =
  "An error occured while voting. Please try again later.";

interface PollCardProps {
  provider: BrowserProvider;
  poll: Poll;
  onVoteSuccess?: () => void;
  onVoteRequest?: () => void;
  onError?: (error: string) => void;
  onPollExpired?: () => void;
}

const bgColors = [
  "bg-gray-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-indigo-100",
  "bg-orange-100",
];

const PollCard: React.FC<PollCardProps> = ({
  poll,
  onVoteSuccess,
  onError,
  onPollExpired,
  provider,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [optionsDisabled, setOptionsDisabled] = useState<boolean>(false);
  const [loadingOption, setLoadingOption] = useState<number | null>(null);

  const { mutate } = useSWRConfig();

  // check if the poll was closed officially by the owner (official result computed on-china)
  const isEnded = poll.is_ended;
  // check if the poll has expired (locally)
  const isExpired = poll.end_time < new Date();
  // check if its voted by the current user
  const isVoted = poll.voted;
  console.log("PollCard -> isVoted", isVoted);
  // extract the winning option if any (will be set by the owner when closing manually the poll!)
  const winningOption = poll.winner ? poll.winner : null;

  const onVoteHandler = async (option_index: number) => {
    console.log("Voting for option", option_index);

    // Now, disable the options
    setOptionsDisabled(true);

    // Now, set the loading state for this option
    setLoadingOption(option_index);

    // cast vote and wait for the response
    try {
      console.log("Voting for option", option_index);

      // Call the vote function
      await castVote(provider, poll.id, BigInt(option_index))
        .then(() => {
          // Now, mutate the parent state tho update the polls
          console.log("Vote casted successfully. Updating...");
          mutate("/polls");

          // notify parent that vote was successful
          onVoteSuccess && onVoteSuccess();
        })
        .finally(() => {
          setOptionsDisabled(false);
          setLoadingOption(null);
        });
    } catch (error) {
      // decode error to get the error message from the smart contract
      const errorDecoder = ErrorDecoder.create();

      errorDecoder
        .decode(error)
        .then((decodedError) => {
          console.error("Error while voting", decodedError.reason);
          onError &&
            onError(decodedError.reason || DEFAULT_VOTING_ERROR_MESSAGE);
        })
        .catch(() => {
          onError && onError(DEFAULT_VOTING_ERROR_MESSAGE);
        })
        .finally(() => {
          setOptionsDisabled(false);
          setLoadingOption(null);
        });
    }
  };

  const StatusBadge = useMemo(() => {
    const { title, color } = (() => {
      if (isEnded) return { title: "Closed", color: "destructive" };
      if (isExpired) return { title: "Expired", color: "destructive" };
      if (isVoted) return { title: "Voted", color: "warning" };
      return { title: "Active", color: "success" };
    })();

    return (
      <Badge
        variant={color as "destructive" | "success" | "warning"}
        className="text-sm"
      >
        {title}
      </Badge>
    );
  }, [isEnded, isExpired, isVoted]);

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200 rounded-lg">
        <CardHeader className="flex justify-between p-4">
          <div className="flex flex-row justify-between items-center space-x-2">
            <div className="flex items-center space-x-2">
              <FaPoll className="text-gray-500 w-5 h-5" />
              <CardTitle className="text-xl font-semibold text-gray-800">
                {poll.name}
              </CardTitle>
              <div className="flex items-center space-x-2">{StatusBadge}</div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaInfoCircle className="text-gray-500 w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View poll details</TooltipContent>
            </Tooltip>
          </div>

          {/* Countdown Timer */}
          {!isEnded ? (
            <Countdown
              end_date={poll.end_time}
              onEnd={() => onPollExpired && onPollExpired()}
            />
          ) : (
            <div className="mt-4 text-red-600 font-semibold">
              This poll has ended.
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <strong className="text-gray-700">Description:</strong>
            <p className="text-gray-600">{poll.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Options:</h3>
            {/* Div with flex-row and when out of space, it wraps */}
            <div className="flex flex-wrap flex-row items-center space-x-2">
              {poll.options.map((option, index) => {
                const isWinner = winningOption && winningOption === option.name;
                return (
                  <li
                    key={index}
                    className={`flex items-center space-x-2 rounded px-2 py-1 ${
                      isWinner
                        ? "bg-green-100 text-green-800 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    <Button
                      className={cn(
                        "rounded-full text-black", // Aggiungi text-black qui
                        bgColors[index % bgColors.length]
                      )}
                      onClick={() => onVoteHandler(index)}
                      disabled={isEnded || optionsDisabled}
                    >
                      {loadingOption === index && <LoadingSpinner />}
                      {isWinner && <FaCrown className="text-yellow-500" />}
                      <div className="flex items-center space-x-1">
                        <span>{option.name}</span>
                        <span className="text-sm text-gray-500">
                          -{" "}
                          <strong>
                            {option.votes.toString()} vote
                            {option.votes !== BigInt(1) && "s"}
                          </strong>
                        </span>
                      </div>
                      {isWinner && (
                        <span className="text-xs text-green-600">
                          (Vincitore)
                        </span>
                      )}
                    </Button>
                  </li>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Poll Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Poll details</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogDescription>
            Details about the poll and its options
          </DialogDescription>
          <div className="p-4 space-y-4 w-full">
            {/* Enhanced Information Section with Icons and Divs */}
            <div className="flex items-center justify-start gap-x-4 text-md text-gray-700">
              <FaUser className="w-5 h-5 text-gray-500" />
              <span>
                <strong>Owner:</strong>
                <p>{poll.owner}</p>
              </span>
            </div>
            <div className="flex items-center gap-x-4 text-md text-gray-700">
              <FaCalendarAlt className="w-5 h-5 text-gray-500" />
              <span>
                <strong>Started:</strong>
                <p>{poll.start_time.toLocaleString()}</p>
              </span>
            </div>
            <div className="flex items-center gap-x-4 text-md text-gray-700">
              <FaClock className="w-5 h-5 text-gray-500" />
              <span>
                <strong>Ends:</strong>
                <p>{poll.end_time.toLocaleString()}</p>
              </span>
            </div>
            <div className="flex items-center gap-x-4 text-md text-gray-700">
              <FaCrown className="w-5 h-5 text-yellow-500" />
              <span>
                <strong>Winner:</strong>{" "}
                {winningOption ? (
                  <span className="inline-flex items-center space-x-1 text-gray-800">
                    <FaCrown className="text-yellow-500" />
                    <div>
                      <p>{winningOption}</p>
                    </div>
                  </span>
                ) : (
                  "No winner yet"
                )}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PollCard;
