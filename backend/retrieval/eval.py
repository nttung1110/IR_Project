from email.mime import image
import shutil
import os 
import os.path as osp 
import json
from tqdm import tqdm
from glob import glob
import numpy as np

import visual_genome.local as vg
from retrieval_methods.graph_retrieval import GraphRetrieval
from retrieval_methods.config import get_default_config
from retrieval_methods.query_reader import load_query_graph

result_dir = '/home/nttung/IR_Project/data/output_raw_data_samples'
img_dir = '/home/nttung/IR_Project/data/data_samples'

cfg = get_default_config()


def main():
    json_dir = osp.join(result_dir, 'json_result')
    list_json = glob(json_dir + '/*.json')
    list_img = os.listdir(img_dir)
    list_id = [int(fname.split('.')[0]) for fname in list_img]
    N = len(list_id)

    cfg.list_id = list_id
    retrieval_model = GraphRetrieval(cfg)
    
    MRR, R_5, R_10 = 0, 0, 0
    best_ids = []
    result_map = {}
    for json_path in tqdm(list_json):
        query_id = int(json_path.split('/')[-1].split('.')[0])
        data = json.load(open(json_path))
        sg = load_query_graph(data)
        
        ret_ids, score = retrieval_model.predict(sg)
        score = np.array(score)
        if score[0] > 2:
            print(f'{query_id}, score: {score[0]}, ret_ids: {ret_ids[:5]}')

        _,id = np.unique(score, return_inverse=True)
        out_rank = (id.max() - id + 1).reshape(score.shape)
        rank = N
        result_map[query_id] = ret_ids
        for i, ret_id in enumerate(ret_ids):
            if ret_id == query_id:
                rank = out_rank[i]
                break
        
        if rank <= 5:
            R_5 += 1
            R_10 += 1
            best_ids.append(query_id)
        elif rank <= 10:
            R_10 += 1

        MRR += 1/rank

        

    R_5 /= N 
    R_10 /= N
    MRR /= N
    print(f'MRR: {MRR}, R@5: {R_5}, R@10: {R_10}')
    with open('./result_map.json', 'w') as f:
        json.dump(result_map, f, indent=2)
    print(f'best_ids {len(best_ids)}: {best_ids[:5]}')
    with open('./best_ids.json', 'w') as f:
        json.dump(best_ids, f, indent=2)

if __name__ == '__main__':
    main()

