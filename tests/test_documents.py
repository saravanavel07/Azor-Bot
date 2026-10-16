"""
Unit Tests for MaltCache AI — Document Processor
"""

import unittest
from src.document_processor import DocumentProcessor


class TestDocumentProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = DocumentProcessor(chunk_size=120, chunk_overlap=30)

    def test_text_chunking(self):
        text = (
            "Cache-Augmented Generation (CAG) accelerates LLM workflows significantly. "
            "It intercepts questions and compares embeddings against an active cache repository. "
            "If similarity is above threshold, it returns the stored response immediately."
        )
        chunks = self.processor.chunk_text(text, doc_name="cag_intro.txt")
        self.assertGreater(len(chunks), 0)
        self.assertTrue(chunks[0]["id"].startswith("cag_intro.txt"))
        self.assertIn("content", chunks[0])
        self.assertGreater(chunks[0]["token_count"], 0)

    def test_empty_text_chunking(self):
        chunks = self.processor.chunk_text("", doc_name="empty.txt")
        self.assertEqual(len(chunks), 0)


if __name__ == "__main__":
    unittest.main()
