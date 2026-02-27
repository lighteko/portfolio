import { redirect } from "next/navigation";

import { PostEditorWorkspace } from "@/components/admin/post-editor-workspace";
import { Button } from "@/components/ui/button";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { createPostInlineAction } from "@/lib/inline-admin-actions";

export default async function BlogNewPostPage() {
  const adminEmail = await getAdminSessionEmail();
  if (!adminEmail) {
    redirect("/admin/login");
  }

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 px-6 py-6 xl:px-10">
      <form action={createPostInlineAction} className="space-y-6">
        <input type="hidden" name="returnTo" value="/blog/new" />
        <PostEditorWorkspace />
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border/70 bg-background/85 py-4 backdrop-blur">
          <Button type="submit" name="intent" value="draft" variant="outline">
            Draft
          </Button>
          <Button type="submit" name="intent" value="publish">
            Publish
          </Button>
        </div>
      </form>
    </section>
  );
}
