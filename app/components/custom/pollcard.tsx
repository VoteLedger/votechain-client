// components/PollCard.tsx
import React, { useEffect, useState } from "react";
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

/** Helper function to format the time difference */
function formatTimeDifference(milliseconds: number) {
  if (milliseconds <= 0) return "0s";

  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

interface PollCardProps {
  provider: BrowserProvider;
  poll: Poll;
  onVoteSuccess?: (pollId: bigint) => void;
  onVoteRequest?: (pollId: bigint) => void;
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

const PollCard: React.FC<PollCardProps> = ({ poll, onVoteSuccess }) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    poll.end_time.getTime() - Date.now()
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [optionsDisabled, setOptionsDisabled] = useState<boolean>(false);
  const [loadingOption, setLoadingOption] = useState<number | null>(null);

  useEffect(() => {
    if (poll.is_ended) return;
    const timer = setInterval(() => {
      const diff = poll.end_time.getTime() - Date.now();
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [poll]);

  const isEnded = poll.is_ended || timeLeft <= 0;
  const winningOption = isEnded && poll.winner ? poll.winner : null;

  const onVoteHandler = (option_index: number) => {
    console.log("Voting for option", option_index);

    // Now, disable the options
    setOptionsDisabled(true);

    // Now, set the loading state for this option
    setLoadingOption(option_index);

    // ... to the hard stuff here ...
    try {
      console.log("Voting for option", option_index);

      // notify parent that vote was successful
      onVoteSuccess && onVoteSuccess(poll.id);
    } catch (error) {
      console.error("Error while voting", error);
    } finally {
      setOptionsDisabled(false);
      setLoadingOption(null);
    }
  };

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
              <div className="flex items-center space-x-2">
                <Badge
                  variant={isEnded ? "destructive" : "success"}
                  className="text-sm"
                >
                  {isEnded ? "Ended" : "Active"}
                </Badge>
              </div>
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
            <div className="flex items-center space-x-2 text-gray-700">
              <FaClock className="w-4 h-4 text-gray-500" />
              <strong>Time left:</strong>
              <span>{formatTimeDifference(timeLeft)}</span>
            </div>
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
                const isWinner = winningOption && winningOption === option;
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
                        <span>{option}</span>
                        <span className="text-sm text-gray-500">
                          -{" "}
                          <strong>
                            {poll.votes[option]
                              ? poll.votes[option].toString()
                              : "0"}
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
