import React from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface PollCardProps {
  name: string;
  description?: string;
  options: string[];
  startTime: Date;
  endTime: Date;
  onVote?: (option: string) => void;
  winner?: string;
  isClosed?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  name,
  description,
  options,
  startTime,
  endTime,
  onVote,
  winner,
  isClosed,
}) => {
  const now = new Date();
  const isVotingPeriod = now >= startTime && now <= endTime;

  return (
    <Card className={cn("max-w-md w-full border rounded-md p-4 shadow")}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className={cn("space-y-2")}>
        <p>
          <strong>Start:</strong> {startTime.toLocaleString()}
        </p>
        <p>
          <strong>End:</strong> {endTime.toLocaleString()}
        </p>

        {isClosed && winner && (
          <p>
            <strong>Winner:</strong> {winner}
          </p>
        )}

        {!isClosed && (
          <div className={cn("mt-4 space-y-2")}>
            {isVotingPeriod ? (
              options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  onClick={() => onVote && onVote(option)}
                >
                  {option}
                </Button>
              ))
            ) : (
              <p>Voting is not open at the moment.</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isClosed && (
          <p className={cn("text-sm text-muted-foreground")}>
            This poll is closed.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};
