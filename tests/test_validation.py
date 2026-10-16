"""
Unit Tests for MaltCache AI — Answer Validation Engine
Tests intent classification, ambiguity detection, evidence quality scoring, and code syntax checks.
"""

import unittest
from src.answer_validator import AnswerValidator


class TestAnswerValidator(unittest.TestCase):
    def test_classify_intent_math(self):
        info = AnswerValidator.classify_intent("Calculate the profit percentage for cost price 40 and selling price 50")
        self.assertEqual(info["intent"], "math")
        self.assertFalse(info["requires_clarification"])

    def test_classify_intent_code(self):
        info = AnswerValidator.classify_intent("How do I implement binary search in Python?")
        self.assertEqual(info["intent"], "code")
        self.assertFalse(info["requires_clarification"])

    def test_classify_intent_ambiguous(self):
        info = AnswerValidator.classify_intent("What is it?")
        self.assertEqual(info["intent"], "ambiguous")
        self.assertTrue(info["requires_clarification"])
        self.assertIn("clarification_question", info)

    def test_evidence_quality_insufficient(self):
        quality, reasons = AnswerValidator.evaluate_evidence_quality([], similarity_threshold=0.40)
        self.assertEqual(quality, "Insufficient")

    def test_evidence_quality_strong(self):
        chunks = [{"similarity_score": 0.88, "content": "Sample"}]
        quality, reasons = AnswerValidator.evaluate_evidence_quality(chunks, similarity_threshold=0.40)
        self.assertEqual(quality, "Strong")

    def test_code_syntax_validation(self):
        valid_code = "def add(a, b):\n    return a + b"
        invalid_code = "def add(a, b\n    return a +"
        self.assertTrue(AnswerValidator.validate_code_syntax(valid_code)["valid_syntax"])
        self.assertFalse(AnswerValidator.validate_code_syntax(invalid_code)["valid_syntax"])


if __name__ == "__main__":
    unittest.main()
