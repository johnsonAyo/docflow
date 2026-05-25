import { Download, Send, Upload } from "lucide-react";
import { workspaceSectionContent } from "@/components/WorkspaceComponents/constants/labels";
import { WorkspaceSectionTitle } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";

type WorkspaceSectionActionsProps = {
  isTestingWebhook: boolean;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  title: WorkspaceSectionTitle;
};

export function WorkspaceSectionActions({
  isTestingWebhook,
  onExportRecords,
  onTestWebhook,
  title,
}: WorkspaceSectionActionsProps) {
  const PrimaryIcon = title === "Process documents" ? Upload : title === "Records" ? Download : Send;

  return (
    <div className="inline-actions">
      {workspaceSectionContent[title].actions.map((action, index) => (
        <button
          className={action.intent === "primary" ? "app-primary-action" : "app-secondary-action"}
          key={action.label}
          type="button"
          disabled={isBusy(title, index, isTestingWebhook)}
          onClick={() => runAction(title, index, onExportRecords, onTestWebhook)}
        >
          {index === 0 ? <PrimaryIcon size={16} aria-hidden="true" /> : null}
          {buttonLabel(title, index, action.label, isTestingWebhook)}
        </button>
      ))}
    </div>
  );
}

function isBusy(title: WorkspaceSectionTitle, index: number, testing: boolean) {
  return title === "Integrations" && index === 0 && testing;
}

function runAction(title: WorkspaceSectionTitle, index: number, exportRecords: () => void, test: () => void) {
  if (title === "Records" && index === 0) exportRecords();
  if (title === "Integrations" && index === 0) test();
}

function buttonLabel(title: WorkspaceSectionTitle, index: number, label: string, testing: boolean) {
  if (title === "Integrations" && index === 0 && testing) return "Testing...";
  return label;
}
