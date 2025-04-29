/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useUpProvider } from "@/services/UPProvider";
import { addParticipantToQuest } from "@/services/firebase";

type ApplyProps = {
  goBack: () => void;
  questData: any
};

function Apply({ goBack, questData }: ApplyProps) {
  const {  accounts } = useUpProvider();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!name || !description) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (name.length > 50) {
      toast.error("Please make your discord name shorter!");
      setLoading(false);
      return;
    }

    if (description.length > 100) {
      toast.error("Please make the POW Link shorter!");
      setLoading(false);
      return;
    }

    try {
      await addParticipantToQuest(questData.tokenId, {discord: name, powLink: description, walletAddress: accounts[0].toLowerCase()})
      toast.success('Success!');
      goBack();
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );


  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4 w-full h-full justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Apply to Quest</CardTitle>
            <CardDescription>
              Apply to this quest by providing your discord name and your proof of work link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Discord name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name of your discord"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">POW Link</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="POW Link"
                  />
                </div>
              </div>
              <CardFooter className="flex justify-between pt-6 px-0">
                <Button
                  disabled={loading}
                  type="button"
                  onClick={goBack}
                  variant="outline"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  type="submit"
                  onClick={handleSubmit}
                  className="cursor-pointer"
                >
                  Apply
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Apply;
