"""
Unit Tests for MaltCache AI — Mathematics Accuracy Engine
Validates arithmetic operations, profit/loss formulas, percentages, and unit checks.
"""

import unittest
from src.answer_validator import AnswerValidator


class TestMathAnswers(unittest.TestCase):
    def test_profit_and_percentage_calculation(self):
        # Profit = SP - CP, Profit% = (Profit / CP) * 100
        # Cost Price: $50, Selling Price: $70 -> Profit: $20, Profit%: 40%
        query = "Cost price is $50, selling price is $70, what is the profit and profit percentage?"
        res = AnswerValidator.solve_mathematics(query)

        self.assertIsNotNone(res)
        self.assertTrue(res["verified"])
        self.assertEqual(res["confidence"], "Strong")
        self.assertEqual(res["calculation_data"]["profit"], 20.0)
        self.assertEqual(res["calculation_data"]["profit_pct"], 40.0)
        self.assertIn("$20.00", res["direct_answer"])
        self.assertIn("40.00%", res["direct_answer"])

    def test_loss_calculation(self):
        # Cost Price: $100, Selling Price: $80 -> Loss: -$20, -20%
        query = "bought for 100, sold for 80, calculate loss"
        res = AnswerValidator.solve_mathematics(query)

        self.assertIsNotNone(res)
        self.assertTrue(res["verified"])
        self.assertEqual(res["calculation_data"]["profit"], -20.0)
        self.assertEqual(res["calculation_data"]["profit_pct"], -20.0)

    def test_percentage_of_total(self):
        # 15% of 80 = 12
        query = "what is 15% of 80?"
        res = AnswerValidator.solve_mathematics(query)

        self.assertIsNotNone(res)
        self.assertTrue(res["verified"])
        self.assertEqual(res["calculation_data"]["result"], 12.0)
        self.assertIn("12", res["direct_answer"])

    def test_basic_arithmetic(self):
        query = "125 + 375"
        res = AnswerValidator.solve_mathematics(query)

        self.assertIsNotNone(res)
        self.assertEqual(res["calculation_data"]["result"], 500.0)

    def test_division_by_zero_safety(self):
        query = "50 / 0"
        res = AnswerValidator.solve_mathematics(query)

        self.assertIsNotNone(res)
        self.assertIn("undefined", res["direct_answer"].lower())


if __name__ == "__main__":
    unittest.main()
