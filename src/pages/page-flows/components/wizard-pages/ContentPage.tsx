
import React from "react";
import { Page } from "../../types";

interface ContentPageProps {
  page: Page;
  onNext: () => void;
}

export const ContentPage: React.FC<ContentPageProps> = ({ page }) => {
  // Safely render HTML content
  return (
    <div className="prose dark:prose-invert max-w-none">
      {page.content ? (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <div className="text-muted-foreground italic">No content provided</div>
      )}
    </div>
  );
};
