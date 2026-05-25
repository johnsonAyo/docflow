import { CheckCircle2, Download, Send, Upload } from "lucide-react";
import { workspaceSectionContent } from "@/components/WorkspaceComponents/constants/labels";
import { WorkspaceSectionTitle } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";

type WorkspaceSectionActionsProps = {
  isApprovingReview: boolean;
  isTestingWebhook: boolean;
  onApproveNextReview: () => void;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  title: WorkspaceSectionTitle;
};

export function WorkspaceSectionActions({
  isApprovingReview,
  isTestingWebhook,
  onApproveNextReview,
  onExportRecords,
  onTestWebhook,
  title,
}: WorkspaceSectionActionsProps) {
  const PrimaryIcon = title === "Runs" ? Upload : title === "Records" ? Download : title === "Integrations" ? Send : CheckCircle2;

  return (
    <div className="inline-actions">
      {workspaceSectionContent[title].actions.map((action, index) => (
        <button
          className={action.intent === "primary" ? "app-primary-action" : "app-secondary-action"}
          key={action.label}
          type="button"
          disabled={isBusy(title, index, isTestingWebhook, isApprovingReview)}
          onClick={() => runAction(title, index, onExportRecords, onApproveNextReview, onTestWebhook)}
        >
          {index === 0 ? <PrimaryIcon size={16} aria-hidden="true" /> : null}
          {buttonLabel(title, index, action.label, isTestingWebhook, isApprovingReview)}
        </button>
      ))}
    </div>
  );
}

function isBusy(title: WorkspaceSectionTitle, index: number, testing: boolean, approving: boolean) {
  return (title === "Integrations" && index === 0 && testing) || (title === "Review queue" && index === 0 && approving);
}

function runAction(title: WorkspaceSectionTitle, index: number, exportRecords: () => void, approve: () => void, test: () => void) {
  if (title === "Records" && index === 0) exportRecords();
  if (title === "Review queue" && index === 0) approve();
  if (title === "Integrations" && index === 0) test();
}

function buttonLabel(title: WorkspaceSectionTitle, index: number, label: string, testing: boolean, approving: boolean) {
  if (title === "Integrations" && index === 0 && testing) return "Testing...";
  if (title === "Review queue" && index === 0 && approving) return "Approving...";
  return label;
}
