import { useState } from "react";
import { Form } from "@remix-run/react"; // Import Form from Remix
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

export type PollFormFields = [
  "name",
  "description",
  "options",
  "startTime",
  "endTime",
  "server"
];

export interface CreatePollDialogProps {
  errors?: {
    [key in PollFormFields[number]]?: string;
  };
}

export const CreatePollDialog: React.FC<CreatePollDialogProps> = ({
  errors = {},
}: CreatePollDialogProps) => {
  // const transition = useTransition();

  const [options, setOptions] = useState<string[]>(["", ""]);

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
        <Form method="post" className="grid gap-4 py-4">
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
