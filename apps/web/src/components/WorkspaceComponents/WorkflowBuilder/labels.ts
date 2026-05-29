export const builderLabels = {
    inspector: {
      status: {
        title: "Workflow status",
        state: "Ready to publish",
        description: (stages: number, fields: number, rules: number) =>
          `${stages} configured stages, ${fields} extracted fields, ${rules} human review rules.`
      },
      latestRun: {
        title: "Latest run"
      },
      evidence: {
        title: "Evidence preview"
      }
    },
    stages: {
      document: {
        kicker: "Document setup",
        title: "Define what this workflow accepts.",
        fields: {
          name: "Workflow name",
          type: "Document type",
          typeOptions: ["Contract", "Invoice", "Vendor form"],
          source: "Intake source",
          sourceOptions: ["Direct upload", "Shared inbox", "API upload"],
          summary: "Workflow summary"
        }
      },
      fields: {
        kicker: "Field schema",
        title: "Define the record schema for this workflow.",
        action: "Add field",
        tableHeaders: ["Field", "Type", "Confidence", "Rule", ""]
      },
      review: {
        kicker: "Review rules",
        title: "Route exceptions to the right people.",
        confidence: {
          kicker: "Confidence",
          title: "Low-confidence fields",
          items: [
            "Review if field confidence is below 82%.",
            "Review if renewal, termination, or payment terms are missing.",
            "Review if liability language is detected in the contract body."
          ]
        },
        assignment: {
          kicker: "Assignment",
          title: "Human review queue",
          items: [
            "Route commercial exceptions to Trade Ops.",
            "Send payment term conflicts to Finance.",
            "Escalate legal clause flags to Legal Ops."
          ]
        }
      },
      delivery: {
        kicker: "Delivery",
        title: "Send approved records downstream.",
        webhook: {
          kicker: "Webhook",
          title: "Procurement endpoint",
          items: [
            "Send reviewed records to procurement webhook.",
            "Store approved extraction with full evidence trail.",
            "Notify operations when obligations require follow-up."
          ]
        },
        export: {
          kicker: "Export",
          title: "Records table",
          items: [
            "Write every approved field to the records table.",
            "Attach source evidence and reviewer decisions.",
            "Make export available as CSV and API response."
          ]
        }
      }
    }
  };
