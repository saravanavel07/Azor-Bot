"""
Unit Tests for MaltCache AI — Document Answers & Grounding
Verifies that relevant documents are retrieved and cited, while irrelevant/unanswerable questions yield honest limitation messages.
"""

import os
import unittest
from src.database import Database
from src.embeddings import EmbeddingsEngine
from src.cache_engine import CacheEngine
from src.retrieval_engine import RetrievalEngine
from src.llm_provider import LLMProvider
from src.answer_generator import AnswerGenerator


class TestDocumentAnswers(unittest.TestCase):
    def setUp(self):
        self.test_db = "test_doc_answers.db"
        if os.path.exists(self.test_db):
            os.remove(self.test_db)
        self.db = Database(self.test_db)
        self.embeddings = EmbeddingsEngine()
        self.cache = CacheEngine(self.db, self.embeddings)
        self.retrieval = RetrievalEngine(self.db, self.embeddings)
        self.llm = LLMProvider()
        self.generator = AnswerGenerator(self.db, self.cache, self.retrieval, self.llm, self.embeddings)

        # Seed document chunk
        chunk_content = (
            "MaltCache AI uses a sliding-window chunk size of 500 characters with a 100-character overlap. "
            "Cosine similarity thresholds between 0.82 and 0.88 yield optimal precision."
        )
        self.db.store_document_chunk(
            chunk_id="chunk_arch_1",
            doc_name="architecture_spec.pdf",
            chunk_index=0,
            content=chunk_content,
            embedding=self.embeddings.embed_text(chunk_content),
            token_count=35,
            metadata={"page": 2},
        )

    def tearDown(self):
        if os.path.exists(self.test_db):
            os.remove(self.test_db)

    def test_relevant_document_grounding(self):
        query = "What is the sliding-window chunk size in the architecture spec?"
        res = self.generator.execute_pipeline(query, mode="RAG")

        self.assertIn("architecture_spec.pdf", str(res["evidence_sources"]))
        self.assertIsNotNone(res["direct_answer"])
        self.assertIn("500", res["direct_answer"])

    def test_unanswerable_document_question_limitation(self):
        # Query asking for completely unrelated document fact
        query = "According to the document, what was the revenue of Nike in 1994?"
        res = self.generator.execute_pipeline(query, mode="RAG")

        # Must declare insufficient evidence instead of inventing a number
        self.assertEqual(res["confidence"], "Insufficient")
        self.assertIn("not contain sufficient evidence", res["direct_answer"].lower())


if __name__ == "__main__":
    unittest.main()
