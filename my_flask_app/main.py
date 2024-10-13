import sklearn
from sklearnex import patch_sklearn
patch_sklearn()
#unpatch_sklearn()
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import pandas as pd
from pandas import MultiIndex, Int16Dtype # if you don't import in this order you will get a pandas.Int64Index fix for FutureWarning error.
import xgboost as xgb
import numpy as np
from time import perf_counter
print("XGB Version          : ", xgb.__version__)
print("Scikit-Learn Version : ", sklearn.__version__)
print("Pandas Version       : ", pd.__version__)