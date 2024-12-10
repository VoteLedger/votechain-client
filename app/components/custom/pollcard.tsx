// components/PollCard.tsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { FaArrowRight } from "react-icons/fa";
import { Poll } from "~/types/services";

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: bigint) => void;
  onViewDetails: (pollId: bigint) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, onViewDetails }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl">{poll.name}</CardTitle>
          <Badge
            variant={poll.is_ended ? "destructive" : "default"}
            className="mt-2"
          >
            {poll.is_ended ? "Ended" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{poll.description}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Options:</h3>
          <ul className="list-disc list-inside">
            {poll.options.map((option, index) => (
              <li key={index} className="text-gray-600">
                {option} - Votes:{" "}
                {poll.votes[option] ? poll.votes[option].toString() : "0"}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p>
            <strong>Owner:</strong> {poll.owner}
          </p>
          <p>
            <strong>Started:</strong> {poll.start_time.toLocaleString()}
          </p>
          <p>
            <strong>Ends:</strong> {poll.end_time.toLocaleString()}
          </p>
          <p>
            <strong>Winner:</strong> {poll.winner || "No winner yet"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {poll.has_voted ? (
          <Badge variant="secondary">You have voted</Badge>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                disabled={poll.is_ended}
                onClick={() => onVote(poll.id)}
              >
                Vote
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {poll.is_ended ? "Poll has ended" : "Cast your vote"}
            </TooltipContent>
          </Tooltip>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(poll.id)}
        >
          <FaArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PollCard;
