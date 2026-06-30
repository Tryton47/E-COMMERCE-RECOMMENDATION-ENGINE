import pandas as pd
import numpy as np
import random

def generate_dummy_data(num_rows=25000):
    categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Toys']
    
    data = []
    for i in range(num_rows):
        data.append({
            'product_id': f"PROD_{i+1:05d}",
            'product_name': f"Dummy Product {i+1}",
            'category': random.choice(categories),
            'price': round(random.uniform(5.0, 1500.0), 2),
            'rating': round(random.uniform(1.0, 5.0), 1),
            'num_reviews': random.randint(1, 5000),
            'description': "This is a dummy description."
        })
        
    df = pd.DataFrame(data)
    # add some missing values and duplicates to test preprocessing
    df.loc[0:100, 'price'] = np.nan
    df.loc[101:200, 'rating'] = np.nan
    df = pd.concat([df, df.iloc[0:50]]) # Add 50 duplicates
    
    df.to_csv('data/amazon_reviews_dummy.csv', index=False)
    print("Generated dummy data: data/amazon_reviews_dummy.csv")

if __name__ == '__main__':
    generate_dummy_data()
