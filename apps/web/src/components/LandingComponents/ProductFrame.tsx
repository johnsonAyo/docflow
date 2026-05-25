import { BadgeCheck, CircleAlert, FileSearch, GitBranch, Globe2, KeyRound, Send, ShieldCheck, Upload } from "lucide-react";

export function ProductFrame() {
  return (
    <div className="product-frame">
      <div className="window-bar"><span /><span /><span /></div>
      <div className="product-layout">
        <aside className="product-sidebar">
          <strong>Docu OCR</strong>
          <span className="active">Workflows</span>
          <span>Runs</span>
          <span>Review queue</span>
          <span>Records</span>
          <span>Integrations</span>
        </aside>
        <div className="product-main">
          <div className="product-header">
            <div><small>Workflow builder</small><strong>Contract intake</strong></div>
            <span>Active</span>
          </div>
          <ProductColumns />
          <ProductFooter />
        </div>
      </div>
    </div>
  );
}

function ProductColumns() {
  return (
    <div className="product-columns">
      <div className="flow-column">
        <FlowNode Icon={Upload} label="Upload documents" status="complete" />
        <FlowNode Icon={FileSearch} label="Extract fields" status="complete" />
        <FlowNode Icon={CircleAlert} label="Review exceptions" status="warning" />
        <FlowNode Icon={Send} label="Deliver record" />
      </div>
      <div className="record-card">
        <div className="record-card-header"><span>Extracted record</span><BadgeCheck size={17} aria-hidden="true" /></div>
        <p>Harbourline Energy Services</p>
        <div className="mini-table">
          <span>Effective date</span><strong>14 May 2026</strong>
          <span>Payment terms</span><strong>Net 45</strong>
          <span>Renewal</span><strong>Needs review</strong>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ Icon, label, status = "" }: { Icon: typeof Upload; label: string; status?: string }) {
  return (
    <div className={`flow-node ${status}`}>
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function ProductFooter() {
  return (
    <div className="product-footer">
      <span><ShieldCheck size={15} aria-hidden="true" />SOC 2 ready</span>
      <span><GitBranch size={15} aria-hidden="true" />Version controlled</span>
      <span><Globe2 size={15} aria-hidden="true" />Webhook delivery</span>
      <span><KeyRound size={15} aria-hidden="true" />Human approval</span>
    </div>
  );
}
