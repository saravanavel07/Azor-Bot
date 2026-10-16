"""
Embeddings Engine for MaltCache AI
Provides vector embedding generation via Sentence Transformers or deterministic fallback semantic encoder.
Includes high-performance NumPy cosine similarity calculation.
"""

import math
import re
from typing import Any, List, Union

try:
    import numpy as np
except ImportError:
    np = None


class EmbeddingsEngine:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._load_model()

    def _load_model(self) -> None:
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        except Exception:
            # Fallback deterministic semantic projector if sentence-transformers is offline or not installed
            self._model = None

    def embed_text(self, text: str) -> List[float]:
        text = text.strip()
        if not text:
            return [0.0] * 384

        if self._model is not None:
            emb = self._model.encode(text, convert_to_numpy=True)
            # Normalize vector to unit length
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
            return emb.tolist()

        # Deterministic semantic hash projection (384 dimensions)
        return self._fallback_embed(text)

    def _fallback_embed(self, text: str) -> List[float]:
        dim = 384
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        if not words:
            return vec

        def fnv1a(s: str) -> int:
            h = 2166136261
            for ch in s:
                h ^= ord(ch)
                h = (h * 16777619) & 0xFFFFFFFF
            return h

        # Generate unigrams, bigrams, and character tri-grams
        for idx, word in enumerate(words):
            # token hash
            h = fnv1a(word)
            pos = h % dim
            vec[pos] += 2.0

            # stem token (first 4-5 chars)
            stem = word[:4] if len(word) >= 4 else word
            h_stem = fnv1a(stem)
            pos_stem = h_stem % dim
            vec[pos_stem] += 1.5

            # Bigram contexts
            if idx > 0:
                bigram = f"{words[idx-1]}_{word}"
                hb = fnv1a(bigram)
                bpos = hb % dim
                vec[bpos] += 2.5

            # Character tri-grams for subword similarity
            for c_i in range(len(word) - 2):
                tri = word[c_i:c_i+3]
                ht = fnv1a(tri)
                tpos = ht % dim
                vec[tpos] += 0.5

        # L2 Normalize
        sum_sq = sum(x * x for x in vec)
        norm = math.sqrt(sum_sq)
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    @staticmethod
    def cosine_similarity(vec1: Union[List[float], Any], vec2: Union[List[float], Any]) -> float:
        if np is not None and isinstance(vec1, np.ndarray) and isinstance(vec2, np.ndarray):
            dot = float(np.dot(vec1, vec2))
            norm1 = float(np.linalg.norm(vec1))
            norm2 = float(np.linalg.norm(vec2))
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return max(-1.0, min(1.0, dot / (norm1 * norm2)))

        # Pure Python calculation
        if len(vec1) != len(vec2) or len(vec1) == 0:
            return 0.0

        dot = 0.0
        norm1 = 0.0
        norm2 = 0.0
        for i in range(len(vec1)):
            v1_i = float(vec1[i])
            v2_i = float(vec2[i])
            dot += v1_i * v2_i
            norm1 += v1_i * v1_i
            norm2 += v2_i * v2_i

        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0

        similarity = dot / (math.sqrt(norm1) * math.sqrt(norm2))
        return max(-1.0, min(1.0, similarity))
