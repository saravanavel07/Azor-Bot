"""
Unit Tests for MaltCache AI — Retrieval Engine
"""

import os
import unittest
from src.database import Database
from src.embeddings import EmbeddingsEngine
from src.retrieval_engine import RetrievalEngine


class TestRetrievalEngine(unittest.TestCase):
    def setUp(self):
        self.test_db_path = "test_retrieval.db"
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)
        self.db = Database(self.test_db_path)
        self.embeddings = EmbeddingsEngine()
        self.retrieval = RetrievalEngine(self.db, self.embeddings, default_top_k=2)

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

    def test_chunk_retrieval_ranking(self):
        # Store test chunks
        chunk1 = "Vector similarity search uses inner products or cosine distance to find nearest neighbors."
        chunk2 = "Photosynthesis is the process by which green plants synthesize nutrients from carbon dioxide and water."
        
        self.db.store_document_chunk(
            chunk_id="c1",
            doc_name="vector_guide.md",
            chunk_index=0,
            content=chunk1,
            embedding=self.embeddings.embed_text(chunk1),
            token_count=15,
        )
        self.db.store_document_chunk(
            chunk_id="c2",
            doc_name="biology.md",
            chunk_index=0,
            content=chunk2,
            embedding=self.embeddings.embed_text(chunk2),
            token_count=15,
        )

        results = self.retrieval.retrieve("How does cosine vector search identify nearest neighbors?")
        self.assertGreater(len(results), 0)
        # First chunk should be vector search guide
        self.assertEqual(results[0]["id"], "c1")
        self.assertGreater(results[0]["similarity_score"], 0.25)


if __name__ == "__main__":
    unittest.main()
