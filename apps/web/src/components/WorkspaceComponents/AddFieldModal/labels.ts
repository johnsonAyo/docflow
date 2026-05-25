export const addFieldModalLabels = {
    kicker: "Structured field",
    title: "Add extraction field",
    closeAria: "Close add field modal",
    fields: {
      name: {
        label: "Field name",
        placeholder: "Contract value"
      },
      type: {
        label: "Field type",
        options: ["Text", "Number", "Date", "Currency", "Company", "Clause", "Terms"]
      },
      source: {
        label: "Evidence source",
        options: ["Header", "Signature block", "Opening clause", "Commercial schedule", "Document body"]
      },
      rule: {
        label: "Review rule",
        options: ["Required", "Flag if missing", "Review below 82%", "Review if changed"]
      },
      instruction: {
        label: "Workflow instruction",
        placeholder: "Extract the total contract value including currency and billing cadence."
      }
    },
    actions: {
      cancel: "Cancel",
      submit: "Add field"
    }
  };
