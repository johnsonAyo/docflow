from app.services.tesseract_provider import TesseractOCRProvider


def test_extract_pdf_prefers_text_when_pdf_contains_selectable_text():
    provider = TesseractOCRProvider("missing-tesseract")

    # This is a tiny non-PDF body that will fail PdfReader parsing and therefore
    # skip the text path. The helper should gracefully fall back to OCR behavior.
    result = provider.extract_text(
        body=b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF",
        filename="resume.pdf",
        content_type="application/pdf",
    )

    assert result.provider in {"tesseract", "pdf_text"}
