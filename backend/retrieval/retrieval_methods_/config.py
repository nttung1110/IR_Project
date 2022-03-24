from yacs.config import CfgNode as CN


def get_default_config():
    cfg = CN() 

    # working directory
    cfg.gallery_dir = '/home/nttung/IR_Project/data/data_repo'
    cfg.relation_weight = 1.0
    cfg.obj_weight = 1.0
    cfg.list_id = None
    
    return cfg