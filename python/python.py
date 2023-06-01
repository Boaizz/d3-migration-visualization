import pandas as pd
import json

df = pd.read_csv('internalflow.csv')
source = df['Source'].unique()
source_dict = {name: i for i, name in enumerate(source)}
destination = df['Destination'].unique()
destination_dict = {name: i + len(source) for i, name in enumerate(destination)}
nodes = [{"node": i, "name": name} for name, i in source_dict.items()]
nodes.extend([{"node": i, "name": name} for name, i in destination_dict.items()])
links = []
for _, row in df.iterrows():
    link = {
        "source": source_dict[row['Source']],
        "target": destination_dict[row['Destination']],
        "value": str(row['Value'])
    }
    links.append(link)
data_dict = {"links": links, "nodes": nodes}
with open('output.json', 'w') as f:
    json.dump(data_dict, f)