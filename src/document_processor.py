"""
Document Processor for MaltCache AI
Handles PDF, TXT, and Markdown document parsing, clean text extraction, and sliding-window chunking.
"""

import io
import re
from typing import Any, Dict, List, Optional


class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @staticmethod
    def extract_text_from_txt_or_md(content_bytes: bytes) -> str:
        try:
            return content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return content_bytes.decode("latin-1", errors="replace")

    @staticmethod
    def extract_text_from_pdf(content_bytes: bytes) -> str:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text_parts = []
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                text_parts.append(f"[Page {page_num + 1}]\n{page_text.strip()}")
            return "\n\n".join(text_parts)
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    def extract_text(self, filename: str, content_bytes: bytes) -> str:
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            return self.extract_text_from_pdf(content_bytes)
        elif lower_name.endswith((".txt", ".md", ".markdown")):
            return self.extract_text_from_txt_or_md(content_bytes)
        else:
            # Fallback to UTF-8 text decoder
            return self.extract_text_from_txt_or_md(content_bytes)

    def chunk_text(
        self,
        text: str,
        doc_name: str,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        c_size = chunk_size or self.chunk_size
        c_overlap = chunk_overlap or self.chunk_overlap

        # Clean text
        normalized = re.sub(r"\r\n", "\n", text)
        paragraphs = normalized.split("\n\n")

        chunks = []
        current_chunk = ""
        current_page = 1
        chunk_idx = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Detect page numbers if extracted from PDF
            page_match = re.search(r"\[Page (\d+)\]", para)
            if page_match:
                current_page = int(page_match.group(1))

            if len(current_chunk) + len(para) + 2 <= c_size:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
            else:
                if current_chunk:
                    token_estimate = max(1, len(current_chunk.split()))
                    chunks.append({
                        "id": f"{doc_name}-chunk-{chunk_idx}",
                        "doc_name": doc_name,
                        "chunk_index": chunk_idx,
                        "content": current_chunk.strip(),
                        "token_count": token_estimate,
                        "metadata": {"page": current_page, "length": len(current_chunk)},
                    })
                    chunk_idx += 1

                    # Retain overlap from end of previous chunk
                    if c_overlap > 0 and len(current_chunk) > c_overlap:
                        current_chunk = current_chunk[-c_overlap:] + "\n\n" + para
                    else:
                        current_chunk = para
                else:
                    # Single paragraph exceeds chunk size, split by slices
                    start = 0
                    while start < len(para):
                        end = min(start + c_size, len(para))
                        slice_text = para[start:end]
                        token_estimate = max(1, len(slice_text.split()))
                        chunks.append({
                            "id": f"{doc_name}-chunk-{chunk_idx}",
                            "doc_name": doc_name,
                            "chunk_index": chunk_idx,
                            "content": slice_text.strip(),
                            "token_count": token_estimate,
                            "metadata": {"page": current_page, "length": len(slice_text)},
                        })
                        chunk_idx += 1
                        start += (c_size - c_overlap) if (c_size > c_overlap) else c_size
                    current_chunk = ""

        if current_chunk.strip():
            token_estimate = max(1, len(current_chunk.split()))
            chunks.append({
                "id": f"{doc_name}-chunk-{chunk_idx}",
                "doc_name": doc_name,
                "chunk_index": chunk_idx,
                "content": current_chunk.strip(),
                "token_count": token_estimate,
                "metadata": {"page": current_page, "length": len(current_chunk)},
            })

        return chunks
