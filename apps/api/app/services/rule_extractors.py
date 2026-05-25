import re
from typing import Any


def money_match(text: str) -> str | None:
    match = re.search(r"(?:total|amount due)[:\s$]*([A-Z]{3}\s*)?\$?([0-9][0-9,]*(?:\.[0-9]{2})?)", text, re.IGNORECASE)
    if match is None:
        return None
    return f"{(match.group(1) or '').strip()} {match.group(2)}".strip()


def date_match(text: str) -> str | None:
    match = re.search(r"(?:due|effective|date)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.IGNORECASE)
    return None if match is None else match.group(1)


def extract_invoice_fields(text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    vendor = re.search(r"vendor[:\s]*(.+)", text, re.IGNORECASE)
    invoice_number = re.search(r"invoice(?: number)?[:\s#-]*([A-Z0-9-]+)", text, re.IGNORECASE)
    total = money_match(text)
    due_date = date_match(text)
    fields = [
        {"name": "Vendor", "value": vendor.group(1).strip() if vendor else "", "confidence": 0.9 if vendor else 0.0},
        {"name": "Invoice number", "value": invoice_number.group(1).strip() if invoice_number else "", "confidence": 0.86 if invoice_number else 0.0},
        {"name": "Due date", "value": due_date or "", "confidence": 0.84 if due_date else 0.0},
        {"name": "Total amount", "value": total or "", "confidence": 0.82 if total else 0.0},
    ]
    return fields, missing_field_issues(fields), average_confidence(fields)


def extract_contract_fields(text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    auto_renewal = "renew" in text.lower()
    effective_date = date_match(text)
    payment_terms = re.search(r"payment terms?[:\s]*(.+)", text, re.IGNORECASE)
    fields = [
        {"name": "Counterparty", "value": "", "confidence": 0.0},
        {"name": "Effective date", "value": effective_date or "", "confidence": 0.84 if effective_date else 0.0},
        {"name": "Renewal clause", "value": "Auto-renewal detected" if auto_renewal else "", "confidence": 0.73 if auto_renewal else 0.0},
        {"name": "Payment terms", "value": payment_terms.group(1).strip() if payment_terms else "", "confidence": 0.8 if payment_terms else 0.0},
    ]
    issues = missing_field_issues(fields)
    if auto_renewal:
        issues.append({"field": "Renewal clause", "message": "Auto-renewal detected"})
    return fields, issues, average_confidence(fields)


def extract_fields(document_type: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], float]:
    if document_type.lower() == "invoice":
        return extract_invoice_fields(text)
    if document_type.lower() == "contract":
        return extract_contract_fields(text)
    fields = [{"name": "Document text", "value": text[:500], "confidence": 0.72 if text else 0.0}]
    issues = [] if text else [{"field": "Document text", "message": "No text extracted"}]
    return fields, issues, 0.72 if text else 0.0


def missing_field_issues(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{"field": field["name"], "message": "Required field missing"} for field in fields if not field["value"]]


def average_confidence(fields: list[dict[str, Any]]) -> float:
    return sum(float(field["confidence"]) for field in fields) / len(fields)
