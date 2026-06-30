import pandas as pd
import os

print("Files in data/ folder:")
print(os.listdir('data'))

# Baca CSV
csv_files = [f for f in os.listdir('data') if f.endswith('.csv')]
print(f"\nFound {len(csv_files)} CSV files")

for csv_file in csv_files:
    df = pd.read_csv(f'data/{csv_file}', nrows=5)
    print(f"\n{'='*60}")
    print(f"File: {csv_file}")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nFirst 3 rows:")
    print(df.head(3))
