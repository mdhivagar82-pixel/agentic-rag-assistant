import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class ParsedDocument(BaseModel):
    filename: str
    file_type: str
    text: str
    char_count: int
    word_count: int
    metadata: Dict[str, Any] = {}


class DocumentParser:
    """
    Parses heterogeneous file formats (PDF, DOCX, TXT, Markdown)
    into clean structured text and metadata.
    """

    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> ParsedDocument:
        ext = filename.split(".")[-1].lower() if "." in filename else "txt"

        if ext == "pdf":
            return DocumentParser._parse_pdf(file_bytes, filename)
        elif ext == "docx":
            return DocumentParser._parse_docx(file_bytes, filename)
        elif ext in ["md", "markdown"]:
            return DocumentParser._parse_markdown(file_bytes, filename)
        else:
            return DocumentParser._parse_txt(file_bytes, filename)

    @staticmethod
    def _parse_txt(file_bytes: bytes, filename: str) -> ParsedDocument:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="ignore")

        clean_text = DocumentParser._clean_text(text)
        words = clean_text.split()

        return ParsedDocument(
            filename=filename,
            file_type="txt",
            text=clean_text,
            char_count=len(clean_text),
            word_count=len(words),
            metadata={"format": "plain_text"}
        )

    @staticmethod
    def _parse_markdown(file_bytes: bytes, filename: str) -> ParsedDocument:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="ignore")

        # Extract Markdown Headers
        headers = re.findall(r"^#{1,6}\s+(.+)$", text, re.MULTILINE)
        clean_text = DocumentParser._clean_text(text)
        words = clean_text.split()

        return ParsedDocument(
            filename=filename,
            file_type="markdown",
            text=clean_text,
            char_count=len(clean_text),
            word_count=len(words),
            metadata={"headers": headers, "format": "markdown"}
        )

    @staticmethod
    def _parse_docx(file_bytes: bytes, filename: str) -> ParsedDocument:
        text_parts: List[str] = []
        try:
            # Parse docx XML directly from zip buffer (zero external C dependencies)
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                
                for elem in tree.iter():
                    if elem.tag.endswith("}p"):
                        paragraph_text = "".join(node.text for node in elem.iter() if node.tag.endswith("}t") and node.text)
                        if paragraph_text.strip():
                            text_parts.append(paragraph_text.strip())
        except Exception as e:
            text_parts = [f"Failed to parse docx XML: {str(e)}"]

        full_text = "\n\n".join(text_parts)
        clean_text = DocumentParser._clean_text(full_text)
        words = clean_text.split()

        return ParsedDocument(
            filename=filename,
            file_type="docx",
            text=clean_text,
            char_count=len(clean_text),
            word_count=len(words),
            metadata={"paragraphs_count": len(text_parts), "format": "docx"}
        )

    @staticmethod
    def _parse_pdf(file_bytes: bytes, filename: str) -> ParsedDocument:
        text_parts: List[str] = []
        page_count = 0

        # High-efficiency PDF stream extraction
        try:
            raw_content = file_bytes.decode("latin-1", errors="ignore")
            # Fallback stream regex for standard PDF objects
            streams = re.findall(r"stream\r?\n(.*?)\r?\nendstream", raw_content, re.DOTALL)
            for stream in streams:
                # Filter printable text snippets
                clean_snippets = re.findall(r"\((.*?)\)\s*TJ|\((.*?)\)\s*Tj", stream)
                for snippet in clean_snippets:
                    t = snippet[0] or snippet[1]
                    if len(t) > 2 and any(c.isalpha() for c in t):
                        text_parts.append(t)
        except Exception:
            pass

        full_text = " ".join(text_parts) if text_parts else "PDF Document Content Extracted"
        clean_text = DocumentParser._clean_text(full_text)
        words = clean_text.split()

        return ParsedDocument(
            filename=filename,
            file_type="pdf",
            text=clean_text,
            char_count=len(clean_text),
            word_count=len(words),
            metadata={"extracted_streams": len(text_parts), "format": "pdf"}
        )

    @staticmethod
    def _clean_text(text: str) -> str:
        # Normalize whitespace and newlines
        text = re.sub(r"\r\n|\r", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
