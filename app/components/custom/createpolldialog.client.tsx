import { useState } from "react";
import { useSWRConfig } from "swr";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea"; // Assuming you have a Textarea component
import { validateCreatePoll } from "~/lib/validator";
import { useEthContext } from "~/providers/ethcontextprovider.client";
import { createPoll, PollRecipt } from "~/services/polls.client";
import { CreatePoll } from "~/types/services";

export type PollFormFields = [
  "name",
  "description",
  "options",
  "startTime",
  "endTime",
  "server"
];

type FormErrors = {
  [key in PollFormFields[number]]?: string;
};

export interface CreatePollDialogProps {
  onSubmit?: () => void;
  onPollCreated?: (poll: PollRecipt) => void;
  onError?: (error: string) => void;
}

export const CreatePollDialog: React.FC<CreatePollDialogProps> = ({
  onPollCreated,
  onError,
}: CreatePollDialogProps) => {
  // const transition = useTransition();
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load provider from context
  const { provider } = useEthContext();

  // Load mutate function from SWR provider
  const { mutate } = useSWRConfig();

  // Ensure that the provider is available
  if (!provider) {
    return null;
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Get current time in ISO format for default start time
  const currentTime = new Date().toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'

  const sanitizePoll = (poll: CreatePoll) => {
    const sanitizedOptions = Array.from(
      new Set(poll.options.map((opt) => opt.trim()).filter((opt) => opt !== ""))
    ); // Remove duplicates and sanitize
    const sanitizedName = poll.name!.trim();
    const sanitizedDescription = poll.description!.trim();

    // Return sanitized poll
    return {
      ...poll,
      name: sanitizedName,
      description: sanitizedDescription,
      options: sanitizedOptions,
    };
  };

  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // remove all errors
    setErrors({});

    // Extract data from form (unsafe but works!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (e.target as any).name.value as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (e.target as any).description.value as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startTime = new Date((e.target as any).startTime.value as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endTime = new Date((e.target as any).endTime.value as string);

    // extract array of options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = Array.from((e.target as any)["options[]"]).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (option: any) => option.value
    );

    // create poll object
    const poll = {
      name,
      description,
      options,
      start_time: startTime,
      end_time: endTime,
    } satisfies CreatePoll;

    // sanitize poll
    const sanitizedPoll = sanitizePoll(poll);

    // validate poll
    const val_errors = validateCreatePoll(sanitizedPoll);
    if (val_errors) {
      setErrors(val_errors);
      return;
    }
    // if all is valid, create the poll
    const recipt = await createPoll(provider, poll);

    // call the onPollCreated callback
    if (recipt) {
      // Tell SWR to revalidate the list of polls in the homepage
      mutate("polls");

      // notify that the poll has been created
      onPollCreated && onPollCreated(recipt);
    } else {
      onError && onError("Failed to create poll.");
      // if the poll was not created, show an error
      setErrors({ server: "Failed to create poll." });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New Poll</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Poll</DialogTitle>
          <DialogDescription>
            Define the poll options and settings
          </DialogDescription>
        </DialogHeader>
        {/* Server-Level Error */}
        {errors.server && (
          <div className="col-span-4 text-red-600">{errors.server}</div>
        )}
        <form className="grid gap-4 py-4" onSubmit={handleSumbit}>
          {/* Poll Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                name="name"
                required
                placeholder="Poll Name"
                defaultValue=""
                className="w-full"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600" id="name-error">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your poll"
                className="w-full"
                rows={4}
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600" id="description-error">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">Options</Label>
            <div className="col-span-3 space-y-2">
              {/* Display Options Error on Top */}
              {errors.options && (
                <p className="text-sm text-red-600">{errors.options}</p>
              )}
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <Input
                    name="options[]"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    aria-invalid={!!errors.options}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-2"
                      aria-label={`Remove Option ${index + 1}`}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={handleAddOption}>
                Add Option
              </Button>
            </div>
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <div className="col-span-3">
              <Input
                type="datetime-local"
                id="startTime"
                name="startTime"
                defaultValue={currentTime}
                className="w-full"
                aria-invalid={!!errors.startTime}
                aria-describedby={
                  errors.startTime ? "startTime-error" : undefined
                }
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600" id="startTime-error">
                  {errors.startTime}
                </p>
              )}
            </div>
          </div>

          {/* End Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <div className="col-span-3">
              <Input
                type="datetime-local"
                id="endTime"
                name="endTime"
                required
                className="w-full"
                aria-invalid={!!errors.endTime}
                aria-describedby={errors.endTime ? "endTime-error" : undefined}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600" id="endTime-error">
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create Poll</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
