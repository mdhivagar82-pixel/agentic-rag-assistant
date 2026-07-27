import math
import hashlib
from typing import List


class EmbeddingGenerator:
    """
    Embedding Generator for vector indexing.
    Supports 384-dimensional dense embeddings with deterministic local fallbacks.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate dense floating-point vector representations for texts.
        """
        embeddings: List[List[float]] = []
        for text in texts:
            embeddings.append(self._embed_single_text(text))
        return embeddings

    def _embed_single_text(self, text: str) -> List[float]:
        """
        Generate a normalized 384-dimensional feature vector.
        """
        vec = [0.0] * self.dimension
        words = text.lower().split()

        for idx, word in enumerate(words):
            # Compute hash slot
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            slot = h % self.dimension
            weight = 1.0 + math.log(1 + len(word))
            vec[slot] += weight

        # Add n-gram sequence signal
        for i in range(len(text) - 2):
            trigram = text[i:i+3].lower()
            h = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16)
            slot = h % self.dimension
            vec[slot] += 0.5

        # L2 Normalization
        magnitude = math.sqrt(sum(v * v for v in vec))
        if magnitude > 0:
            vec = [v / magnitude for v in vec]
        else:
            vec = [1.0 / math.sqrt(self.dimension)] * self.dimension

        return vec
