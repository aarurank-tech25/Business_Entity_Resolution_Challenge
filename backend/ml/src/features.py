import re
import pandas as pd
from difflib import SequenceMatcher


def clean_text(value):
    """
    Convert value into a clean lowercase string.
    """

    if pd.isna(value):
        return ""

    value = str(value).lower().strip()

    value = re.sub(r"[^a-z0-9\s]", " ", value)

    value = re.sub(r"\s+", " ", value).strip()

    return value


def token_set(value):
    """
    Convert text into a set of tokens.
    """

    value = clean_text(value)

    if not value:
        return set()

    return set(value.split())


def jaccard_similarity(text1, text2):
    """
    Calculate token-level Jaccard similarity.

    Formula:

        intersection / union
    """

    tokens1 = token_set(text1)
    tokens2 = token_set(text2)

    if not tokens1 and not tokens2:
        return 1.0

    if not tokens1 or not tokens2:
        return 0.0

    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))

    return intersection / union


def sequence_similarity(text1, text2):
    """
    Calculate character/string similarity.
    """

    text1 = clean_text(text1)
    text2 = clean_text(text2)

    if not text1 and not text2:
        return 1.0

    if not text1 or not text2:
        return 0.0

    return SequenceMatcher(None, text1, text2).ratio()


def exact_match(text1, text2):
    """
    Check whether two values are exactly equal
    after normalization.
    """

    text1 = clean_text(text1)
    text2 = clean_text(text2)

    if not text1 or not text2:
        return 0

    return int(text1 == text2)


def country_match(country1, country2):
    """
    Check whether country values match.
    """

    country1 = clean_text(country1)
    country2 = clean_text(country2)

    if not country1 or not country2:
        return 0

    return int(country1 == country2)


def calculate_features(source1_row, candidate_row):
    """
    Calculate matching features between one Source 1
    entity and one Source 2/Source 3 candidate.

    Returns a dictionary suitable for ML training.
    """

    name1 = source1_row.get("business_name_normalized", "")
    name2 = candidate_row.get("business_name_normalized", "")

    address1 = source1_row.get("business_address_normalized", "")
    address2 = candidate_row.get("business_address_normalized", "")

    country1 = source1_row.get("country_normalized", "")
    country2 = candidate_row.get("country_normalized", "")

    features = {

        # -----------------------------
        # Business name features
        # -----------------------------

        "name_exact": exact_match(
            name1,
            name2
        ),

        "name_jaccard": jaccard_similarity(
            name1,
            name2
        ),

        "name_sequence": sequence_similarity(
            name1,
            name2
        ),

        # -----------------------------
        # Address features
        # -----------------------------

        "address_exact": exact_match(
            address1,
            address2
        ),

        "address_jaccard": jaccard_similarity(
            address1,
            address2
        ),

        "address_sequence": sequence_similarity(
            address1,
            address2
        ),

        # -----------------------------
        # Country feature
        # -----------------------------

        "country_match": country_match(
            country1,
            country2
        )
    }

    return features