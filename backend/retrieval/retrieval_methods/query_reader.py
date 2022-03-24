import json 

from visual_genome.models import Image, Region, Object, Relationship, Graph

def load_query_graph(query_data):
    obj_info = query_data['object_info']
    rel_info = query_data['relationship_info']

    obj_map, rel_map = {}, {}
    list_objs, list_rels = [], []
    for k, v in obj_info.items():
        obj_id = int(k)
        x1, y1, x2, y2 = v['bbox']
        x, y, w, h = (x1+x2)/2, (y1+y2)/2, x2-x1, y2-y1
        obj_ins = Object(id=obj_id, x=x, y=y, width=w, height=h, names=[v['label']], synsets=None)
        list_objs.append(obj_ins)
        obj_map[int(k)] = obj_ins

    for rel_id, rel_data in enumerate(rel_info):
        sub_id, obj_id, predicate, score = rel_data
        subject = str(obj_map[sub_id])
        object = str(obj_map[obj_id])
        rel_ins = Relationship(
            id=rel_id, subject=subject, predicate=predicate, object=object, synset=None)
        
        rel_map[rel_id] = rel_ins
        list_rels.append(rel_ins)
    
    graph = Graph(objects=list_objs, relationships=list_rels, image=None, attributes=None)
    return graph
