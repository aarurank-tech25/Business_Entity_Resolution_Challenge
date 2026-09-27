import pandas as pd
import re
from collections import defaultdict


def clean_text(value):
    if pd.isna(value):
        return ""

    value = str(value).lower().strip()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def get_name_prefix(name, length=4):
    name = clean_text(name)
    return name[:length] if name else ""


def get_first_token(text):
    text = clean_text(text)
    return text.split()[0] if text else ""


def get_address_prefix(address, length=6):
    address = clean_text(address)
    return address[:length] if address else ""


def get_address_number(address):
    """
    Extract the first numeric part of an address.

    Example:
    '1795 westchester drive high point nc'
    -> '1795'
    """
    address = clean_text(address)

    if not address:
        return ""

    match = re.search(r"\b\d+\b", address)

    if match:
        return match.group(0)

    return ""


def get_name_tokens(name):
    """
    Return useful individual name tokens.
    """
    name = clean_text(name)

    if not name:
        return []

    tokens = name.split()

    # Ignore extremely short/common tokens.
    return [
        token
        for token in tokens
        if len(token) >= 3
    ]


def prepare_dataframe(df):
    """
    Create normalized columns and blocking keys.
    """

    df = df.copy()

    if "business_name_normalized" not in df.columns:
        df["business_name_normalized"] = (
            df["business_name"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"[^a-z0-9\s]", " ", regex=True)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )
    else:
        df["business_name_normalized"] = (
            df["business_name_normalized"]
            .fillna("")
            .astype(str)
        )

    if "business_address_normalized" not in df.columns:
        df["business_address_normalized"] = (
            df["business_address"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"[^a-z0-9\s]", " ", regex=True)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )
    else:
        df["business_address_normalized"] = (
            df["business_address_normalized"]
            .fillna("")
            .astype(str)
        )

    if "country_normalized" not in df.columns:
        df["country_normalized"] = (
            df["country"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"[^a-z0-9\s]", " ", regex=True)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )
    else:
        df["country_normalized"] = (
            df["country_normalized"]
            .fillna("")
            .astype(str)
        )

    df["_name_exact"] = df["business_name_normalized"]

    df["_name_prefix"] = (
        df["business_name_normalized"]
        .str[:4]
    )

    df["_first_token"] = (
        df["business_name_normalized"]
        .str.split()
        .str[0]
        .fillna("")
    )

    df["_address_prefix"] = (
        df["business_address_normalized"]
        .str[:6]
    )

    df["_address_number"] = (
        df["business_address_normalized"]
        .str.extract(r"(\b\d+\b)", expand=False)
        .fillna("")
    )

    df["_country"] = df["country_normalized"]

    return df


def build_index(df, key_function):
    """
    Build a lightweight dictionary index.

    key -> list of entity IDs

    This is much faster during candidate generation
    than repeatedly iterating through DataFrame groups.
    """

    index = defaultdict(list)

    for entity_id, name, address, country in zip(
        df["entity_id"].values,
        df["_name_exact"].values,
        df["_address_number"].values,
        df["_country"].values,
    ):
        key = key_function(name, address, country)

        if key:
            index[key].append(entity_id)

    return index


def create_indexes(df):
    """
    Build all lightweight candidate indexes in a single fast pass over the DataFrame.
    """
    indexes = {
        "exact": defaultdict(list),
        "prefix": defaultdict(list),
        "first_token": defaultdict(list),
        "address_number": defaultdict(list),
    }

    entity_ids = df["entity_id"].values
    names = df["_name_exact"].values
    prefixes = df["_name_prefix"].values
    first_tokens = df["_first_token"].values
    addr_nums = df["_address_number"].values
    countries = df["_country"].values

    for eid, name, prefix, ft, addr_num, country in zip(
        entity_ids, names, prefixes, first_tokens, addr_nums, countries
    ):
        if not country:
            continue

        if name:
            indexes["exact"][(name, country)].append(eid)
            indexes["first_token"][(ft, country)].append(eid)
            if len(name) >= 2 and prefix:
                indexes["prefix"][(prefix, country)].append(eid)

        if addr_num:
            indexes["address_number"][(addr_num, country)].append(eid)

    return indexes


def generate_candidates(
    source1,
    source2,
    source3,
    max_candidates_per_source=500
):
    """
    Generate candidate pairs using efficient blocking.

    Blocking rules:

    1. Exact name + country
    2. Name prefix + country
    3. First name token + country
    4. Address prefix + country
    5. Address number + country
    6. Individual name tokens + country

    Candidate pairs are deduplicated.
    """

    print("Preparing blocking data...")

    s1 = prepare_dataframe(source1)
    s2 = prepare_dataframe(source2)
    s3 = prepare_dataframe(source3)

    # ---------------------------------------------------------
    # Build lightweight indexes
    # ---------------------------------------------------------

    print("Building Source 2 indexes...")
    s2_indexes = create_indexes(s2)

    print("Building Source 3 indexes...")
    s3_indexes = create_indexes(s3)

    # ---------------------------------------------------------
    # Candidate generation
    # ---------------------------------------------------------

    candidates = set()

    def add_ids(
        source1_id,
        ids,
        candidate_source
    ):
        if not ids:
            return

        # Prevent extremely large blocks from exploding.
        if len(ids) > max_candidates_per_source:
            ids = ids[:max_candidates_per_source]

        for candidate_id in ids:
            candidates.add(
                (
                    source1_id,
                    candidate_id,
                    candidate_source
                )
            )

    def process_source(s1_df, indexes, candidate_source):
        eids = s1_df["entity_id"].values
        names = s1_df["_name_exact"].values
        prefixes = s1_df["_name_prefix"].values
        first_tokens = s1_df["_first_token"].values
        addr_nums = s1_df["_address_number"].values
        countries = s1_df["_country"].values

        exact_idx = indexes["exact"]
        prefix_idx = indexes["prefix"]
        ft_idx = indexes["first_token"]
        addr_idx = indexes["address_number"]

        for source1_id, name, prefix, first_token, address_number, country in zip(
            eids, names, prefixes, first_tokens, addr_nums, countries
        ):
            if not country:
                continue

            if name:
                add_ids(source1_id, exact_idx.get((name, country)), candidate_source)

            if prefix:
                add_ids(source1_id, prefix_idx.get((prefix, country)), candidate_source)

            if first_token:
                add_ids(source1_id, ft_idx.get((first_token, country)), candidate_source)

            if address_number:
                add_ids(source1_id, addr_idx.get((address_number, country)), candidate_source)

    print("Generating candidates...")

    process_source(s1, s2_indexes, "source2")
    process_source(s1, s3_indexes, "source3")

    # ---------------------------------------------------------
    # Create result
    # ---------------------------------------------------------

    result = pd.DataFrame(
        list(candidates),
        columns=[
            "source1_entity_id",
            "candidate_entity_id",
            "candidate_source"
        ]
    )

    if result.empty:
        return result

    return result.drop_duplicates(
        ignore_index=True
    )