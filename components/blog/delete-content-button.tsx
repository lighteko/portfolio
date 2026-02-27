"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteContentButtonProps = {
  id: string;
  returnTo: string;
  action: (formData: FormData) => void | Promise<void>;
  itemType: string;
};

export function DeleteContentButton({ id, returnTo, action, itemType }: DeleteContentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" type="button" variant="destructive" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
            <p className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="size-5 text-amber-500" />
              Confirm delete
            </p>
            <p className="text-sm text-muted-foreground">
              Delete this {itemType}? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
