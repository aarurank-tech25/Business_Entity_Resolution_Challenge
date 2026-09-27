import re
import unicodedata
import pandas as pd



def clean_text(value):
    """
    Basic text cleaning used by the normalization functions.

    - Handles missing values
    - Normalizes Unicode
    - Converts text to lowercase
    - Normalizes whitespace
    """

    if pd.isna(value):
        return ""

    value = str(value)


    value = unicodedata.normalize("NFKC", value)

    
    value = value.lower()


    value = re.sub(r"\s+", " ", value)

    return value.strip()


def normalize_name(value):
    """
    Normalize a business name for entity matching.

    Example:
        "ABC Technologies Pvt. Ltd."
        -> "abc technologies"
    """

    value = clean_text(value)

    if not value:
        return ""

    
    value = re.sub(r"[^\w\s]", " ", value)

    
    value = re.sub(r"\s+", " ", value).strip()

 
    legal_suffixes = [
        "private limited",
        "privately limited",
        "pvt ltd",
        "pvt limited",
        "limited",
        "ltd",
        "llc",
        "incorporated",
        "inc",
        "corporation",
        "corp",
        "company",
        "co"
    ]

    for suffix in legal_suffixes:

        pattern = r"\b" + re.escape(suffix) + r"\b$"

        value = re.sub(
            pattern,
            "",
            value
        ).strip()

   
    value = re.sub(r"\s+", " ", value)

    return value.strip()




def normalize_address(value):
    """
    Normalize a business address.

    - Handles missing addresses
    - Normalizes Unicode
    - Converts to lowercase
    - Removes punctuation
    - Normalizes whitespace
    """

    value = clean_text(value)

    if not value:
        return ""

    # Replace punctuation with spaces
    value = re.sub(r"[^\w\s]", " ", value)

    # Normalize whitespace
    value = re.sub(r"\s+", " ", value)

    return value.strip()



def normalize_country(value):
    """
    Normalize country values.

    Country is kept as an open-set string.
    We do NOT restrict it to only US or India.
    """

    value = clean_text(value)

    if not value:
        return ""


    value = re.sub(r"[^\w\s]", " ", value)


    value = re.sub(r"\s+", " ", value)

    return value.strip()




def preprocess_dataframe(df):
    """
    Add normalized columns to a dataframe.

    Original columns are preserved.

    Added columns:
        business_name_normalized
        business_address_normalized
        country_normalized
    """

    result = df.copy()

    
    if "business_name" in result.columns:
        result["business_name_normalized"] = (
            result["business_name"].apply(normalize_name)
        )


    if "business_address" in result.columns:
        result["business_address_normalized"] = (
            result["business_address"].apply(normalize_address)
        )

    
    if "country" in result.columns:
        result["country_normalized"] = (
            result["country"].apply(normalize_country)
        )

    return result