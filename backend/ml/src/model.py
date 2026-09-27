import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import precision_score, recall_score, fbeta_score


FEATURE_COLUMNS = [
    "name_exact",
    "name_jaccard",
    "name_sequence",
    "address_exact",
    "address_jaccard",
    "address_sequence",
    "country_match"
]


def prepare_features(feature_dataframe):
    """
    Select the feature columns required by the model.
    """

    return feature_dataframe[FEATURE_COLUMNS].fillna(0)


def train_model(feature_dataframe, labels):
    """
    Train a lightweight Logistic Regression matching model.

    Parameters
    ----------
    feature_dataframe : pandas DataFrame
        Matching features.

    labels : pandas Series/list
        1 = match
        0 = non-match

    Returns
    -------
    trained_model
    """

    X = prepare_features(feature_dataframe)

    y = pd.Series(labels).astype(int)

    model = Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=42
            )
        )
    ])

    model.fit(X, y)

    return model


def predict_probabilities(model, feature_dataframe):
    """
    Return probability that each candidate pair is a match.
    """

    X = prepare_features(feature_dataframe)

    probabilities = model.predict_proba(X)[:, 1]

    return probabilities


def predict_matches(
    model,
    feature_dataframe,
    threshold=0.5
):
    """
    Convert model probabilities into match / no-match decisions.

    threshold:
        probability >= threshold -> match
        probability < threshold  -> no match
    """

    probabilities = predict_probabilities(
        model,
        feature_dataframe
    )

    predictions = (
        probabilities >= threshold
    ).astype(int)

    return predictions


def evaluate_model(
    model,
    feature_dataframe,
    labels,
    threshold=0.5
):
    """
    Evaluate model using precision, recall and F0.5.

    F0.5 gives more importance to precision,
    which helps reduce false merges.
    """

    predictions = predict_matches(
        model,
        feature_dataframe,
        threshold
    )

    labels = pd.Series(labels).astype(int)

    precision = precision_score(
        labels,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        labels,
        predictions,
        zero_division=0
    )

    f05 = fbeta_score(
        labels,
        predictions,
        beta=0.5,
        zero_division=0
    )

    return {
        "precision": precision,
        "recall": recall,
        "f0.5": f05,
        "threshold": threshold
    }