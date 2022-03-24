from operator import is_
import sys
import os 
import os.path as osp
from collections import defaultdict
from tqdm import tqdm
from typing import List

import numpy as np
from scipy.optimize import linear_sum_assignment

import visual_genome.local as vg
from visual_genome.models import Object, Relationship, Graph
from .config import CN
from .retrieve_utils import compare_str

DEBUG = False

class GraphRetrieval(object):
    def __init__(self, cfg: CN) -> None:
        self.rel_weight = cfg.relation_weight
        self.obj_weight = cfg.obj_weight
        self.gallery_dir = cfg.gallery_dir
        self.list_id = cfg.list_id
        self.gallery = defaultdict(None)

        self._init_gallery()
        pass

    def _init_gallery(self):
        all_img = vg.get_all_image_data(self.gallery_dir)
        if self.list_id is not None:
            all_img = [img for img in all_img if img.id in self.list_id]
        
        img_map = {img.id: img for img in all_img}
        by_id = osp.join(self.gallery_dir, 'by-id') + '/'
        self.final_ids = []
        for img in all_img:
            img_sg = vg.get_scene_graph(image_id=img.id, images=img_map, image_data_dir=by_id)
            self.gallery[img.id] = img_sg
            self.final_ids.append(img.id)

    def predict(self, query_sg):
        rel_score = self.relation_score(query_sg.relationships)
        obj_score = self.object_score(query_sg.objects)

        total_score = np.array(rel_score)*self.rel_weight + np.array(obj_score)*self.obj_weight
        rank_ids = np.argsort(total_score)
        rank_ids = rank_ids[::-1]
        sorted_score = [total_score[i] for i in rank_ids]
        pred_ids = [self.final_ids[i] for i in rank_ids]
        return pred_ids, sorted_score

    def relation_score(self, query_rels):
        if DEBUG:
            print(f'Compare relation')
        
        list_scores = []
        for sample_id in self.final_ids:
            sample = self.gallery[sample_id]
            rel_score = self.compare_graph_relations(query_rels, sample.relationships)
            list_scores.append(rel_score)
            
        return list_scores

    def object_score(self, query_objs):
        if DEBUG:
            print(f'Compare object')
        
        list_scores = []
        for sample_id in self.final_ids:
            sample = self.gallery[sample_id]
            obj_score = self.compare_graph_objects(query_objs, sample.objects)
            list_scores.append(obj_score)
            
        return list_scores


    def compare_graph_relations(self, a_rels: List[Relationship], b_rels: List[Relationship]):
        n_a, n_b = len(a_rels), len(b_rels)
        if n_a == 0 or n_b == 0:
            return 0

        list_rows= []
        for a_rel in a_rels:
            row = []
            for b_rel in b_rels:
                score = self.compare_relation(a_rel, b_rel)
                row.append(score)

            list_rows.append(row)
        
        cost_matrix = np.array(list_rows)
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        return cost_matrix[row_ind, col_ind].sum()

    def compare_graph_objects(self, a_objs: List[Object], b_objs: List[Object]):
        a_str_objs = [str(s).lower() for s in a_objs]
        b_str_objs = [str(s).lower() for s in b_objs]
        ab_inter = set(a_str_objs).intersection(set(b_str_objs))
        score = len(ab_inter)
                
        return score

    def compare_relation(self, a_rel: Relationship, b_rel: Relationship):
        score = 0
        
        is_pred = compare_str(a_rel.predicate, b_rel.predicate)
        is_sub = compare_str(a_rel.subject, b_rel.subject)
        is_obj = compare_str(a_rel.object, b_rel.object)

        if not is_pred:
            return 0.0
        
        score += 1

        # Rules ...
        if is_sub:
            score += 2
        if is_obj:
            score += 1
        
        return score
