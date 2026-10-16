"""
Unit Tests for MaltCache AI — Cache Engine
"""

import os
import unittest
from src.database import Database
from src.embeddings import EmbeddingsEngine
from src.cache_engine import CacheEngine


class TestCacheEngine(unittest.TestCase):
    def setUp(self):
        self.test_db_path = "test_cache.db"
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)
        self.db = Database(self.test_db_path)
        self.embeddings = EmbeddingsEngine()
        self.cache = CacheEngine(self.db, self.embeddings, similarity_threshold=0.80)

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

    def test_store_and_lookup_exact(self):
        query = "What is the capital of France?"
        answer = "Paris is the capital of France."
        self.cache.store(query, answer, model="test-model")

        res = self.cache.lookup(query)
        self.assertTrue(res["hit"])
        self.assertGreaterEqual(res["similarity_score"], 0.95)
        self.assertEqual(res["cached_entry"]["answer"], answer)

    def test_semantic_match_rephrased(self):
        original = "How do I optimize database query performance?"
        rephrased = "What are methods to make database queries run faster?"
        answer = "Use indexes, optimize joins, and avoid N+1 queries."
        self.cache.store(original, answer, model="test-model")

        res = self.cache.lookup(rephrased)
        self.assertIsNotNone(res["cached_entry"])
        self.assertGreater(res["similarity_score"], 0.15)

    def test_dissimilar_query_miss(self):
        self.cache.store("How do cars work?", "Cars use internal combustion engines or batteries.", model="test-model")
        res = self.cache.lookup("What is the recipe for chocolate cake?")
        self.assertFalse(res["hit"])

    def test_invalidate(self):
        entry_id = self.cache.store("Sample query", "Sample answer", model="test-model")
        deleted = self.cache.invalidate(entry_id)
        self.assertTrue(deleted)
        res = self.cache.lookup("Sample query")
        self.assertFalse(res["hit"])


if __name__ == "__main__":
    unittest.main()
