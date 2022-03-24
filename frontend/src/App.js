import './App.css';
import React from 'react';
import data_1st from './demo.json';

const BLUE = '#86DADE';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      is_send: true,
      is_retrieve: true,
      box1: { position: 'absolute', left: 45, top: 65, right: 50, bottom: 100, border: '3px solid', 'borderColor': "#86DADE", display: 'none' },
      box2: { position: 'absolute', left: 55, top: 95, right: 60, bottom: 150, border: '3px solid', 'borderColor': "#86DADE", display: 'none' },
      include_items: [],
      exclude_items: []


    };
    this.imgRef = React.createRef();
  }
  onClickInclude(index) {
    let new_includes = this.state.include_items.slice();
    const item = new_includes[index]
    new_includes.splice(index, 1)
    let new_excludes = this.state.exclude_items.slice();
    new_excludes.push(item)
    this.setState({ include_items: new_includes });
    this.setState({ exclude_items: new_excludes })
  }

  onClickExclude(index) {
    let new_excludes = this.state.exclude_items.slice();
    const item = new_excludes[index]
    new_excludes.splice(index, 1)
    let new_includes = this.state.include_items.slice();
    new_includes.push(item)
    this.setState({ include_items: new_includes });
    this.setState({ exclude_items: new_excludes })
  }
  createItemList(results) {
    const get_key = (e) => {
      const p = e[2]
      const s = objs[e[0]]["label"]
      const o = objs[e[1]]["label"]
      return `${s} ${p} ${o}`
    };
    const get_boxes = (e) => {
      const box1 = objs[e[0]]["bbox"]
      const box2 = objs[e[1]]["bbox"]
      return [box1, box2]
    };
    let item_list = [];
    let results2 = results.results.relationship_info
    let objs = results.results.object_info
    results2.forEach(e => {
      const keys = get_key(e);
      const boxes = get_boxes(e);
      item_list.push({
        [keys]: boxes
      })
    });
    return item_list

  };

  imageChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const fileshere = e.target.files[0];
      this.setState({ image: fileshere });
    }
  }

  removeSelectedImage() {
    this.setState({ image: null });
  }

  get_size(w, h) {
    let min_size = 600
    let max_size = 1000
    let size = min_size
    let min_original_size = Math.min(w, h)
    let max_original_size = Math.max(w, h)
    if (max_original_size / min_original_size * size > max_size) {
      size = Math.round(max_size * min_original_size / max_original_size)
      // console.log(size)
    }
    // console.log(size)
    if ((w <= h && w === size) || (h <= w && h === size)) {
      return [w, h]
    }
    let ow = null;
    let oh = null;
    if (w < h) {
      ow = size
      oh = size * h / w
    }
    else {
      oh = size
      ow = size * w / h
    }
    // console.log([ow, oh]);
    // return [ow, oh]
    return [w,h]
  }

  // TODO 
  async sendImage() {
    // receive
    const formData = new FormData();
    formData.append(
      "image_file",
      this.state.image
    );
    // const data = await fetch("http://localhost:5000/infer_image", {
    //   method: "post",
    //   body: formData,
    // });
    // const data = await fetch("http://bf59-115-73-179-200.ngrok.io/api/graph_gen/gen/", {
    //   method: "post",
    //   body: formData,
    // });
    // const results = await data.json();
    // console.log(results);
    let results = data_1st;
    // set
    const item_list = this.createItemList(results);
    // console.log(item_list);
    this.setState({ is_send: true, include_items: item_list });
  }

  // TODO 
  retrieveImages() {
    this.setState({ is_retrieve: true });
  }

  backFirstPage() {
    this.setState({ is_send: false, is_retrieve: false, image: null })
  }
  hoverEnterMouse(e) {
    const bboxs = e[Object.keys(e)[0]];
    const get_sized = this.get_size(this.imgRef.current.naturalWidth, this.imgRef.current.naturalHeight)
    const scaleW = get_sized[0] / this.imgRef.current.clientWidth;
    const scaleH = get_sized[1] / this.imgRef.current.clientHeight;
    this.setState({
      box1: { position: 'absolute', left: bboxs[0][0] / scaleW, top: bboxs[0][1] / scaleH, width: (bboxs[0][2] - bboxs[0][0]) / scaleW, height: (bboxs[0][3] - bboxs[0][1]) / scaleH, border: '3px solid', 'borderColor': "red", display: 'inline-block' },
      box2: { position: 'absolute', left: bboxs[1][0] / scaleW, top: bboxs[1][1] / scaleH, width: (bboxs[1][2] - bboxs[1][0]) / scaleW, height: (bboxs[1][3] - bboxs[1][1]) / scaleH, border: '3px solid', 'borderColor': "red", display: 'inline-block' }
    });
  }
  hoverLeaveMouse(e) {
    const bboxs = e[Object.keys(e)[0]];
    const get_sized = this.get_size(this.imgRef.current.naturalWidth, this.imgRef.current.naturalHeight)
    const scaleW = get_sized[0] / this.imgRef.current.clientWidth;
    const scaleH = get_sized[1] / this.imgRef.current.clientHeight;
    this.setState({
      box1: { position: 'absolute', left: bboxs[0][0] / scaleW, top: bboxs[0][1] / scaleH, width: (bboxs[0][2] - bboxs[0][0]) / scaleW, height: (bboxs[0][3] - bboxs[0][1]) / scaleH, border: '3px solid', 'borderColor': "red", display: 'none' },
      box2: { position: 'absolute', left: bboxs[1][0] / scaleW, top: bboxs[1][1] / scaleH, width: (bboxs[1][2] - bboxs[1][0]) / scaleW, height: (bboxs[1][3] - bboxs[1][1]) / scaleH, border: '3px solid', 'borderColor': "red", display: 'none' }
    });
  }
  render() {
    const rendered_include_items = this.state.include_items.map((e, i) => {
      return (
        <li key={i} onClick={() => this.onClickInclude(i)}
          onMouseEnter={() => this.hoverEnterMouse(e)}
          onMouseLeave={() => this.hoverLeaveMouse(e)}
        >{Object.keys(e)[0]}</li>
      );
    });
    const rendered_exclude_items = this.state.exclude_items.map((e, i) => {
      return (
        <li key={i} onClick={() => this.onClickExclude(i)}
          onMouseEnter={(e) => this.hoverEnterMouse(e)}
          onMouseLeave={() => this.hoverLeaveMouse(e)}
        >{Object.keys(e)[0]}</li>
      );
    });
    const previewimg = () => {
      if (this.state.image) {
        return (
          <div style={styles.preview}>
            <img
              src={URL.createObjectURL(this.state.image)}
              style={styles.image}
              alt="Thumb"
            />
            <div className='flex flex-row space-x-5 justify-between my-1'>
              <button onClick={() => this.removeSelectedImage()} style={styles.delete} className='rounded-lg'>
                Remove This Image
              </button>
              <button onClick={() => this.sendImage()} style={styles.submit} className='rounded-lg'>
                Submit This Image
              </button>
            </div>
          </div>
        )
      }
      else {
        return (          
        <div style={styles.preview}>
          <img
            src='empty-300x240.jpg'
            style={styles.image}
            alt="Thumb"
          />
        </div>
        );
      }
    };

    const view_scene_graph = () => {
      if (this.state.is_send && !this.state.is_retrieve) {
        return (
          <div>
            <div>
              <div className='flex flex-col items-center'>
                <button onClick={() => this.retrieveImages()} style={styles.submit} className="rounded-lg my-3">
                  Retrieve!
                </button>
              </div>
              <div className='flex flex-row'>
                <div className='basis-1/4 mx-1'>
                  <div style={{ backgroundColor: BLUE, textAlign: 'center' }}>Exclude</div>
                  <div style={{ height: 200 }} className='overflow-y-scroll'>
                    <ul>
                      {rendered_exclude_items}
                    </ul>
                  </div>
                </div>
                <div className='basis-1/4  mx-1' >
                  <div style={{ backgroundColor: BLUE, textAlign: 'center' }}>Include</div>
                  <div style={{ height: 200 }} className='overflow-y-scroll'>
                    <ul>
                      {rendered_include_items}
                    </ul>
                  </div>
                </div>

                <div id="img_container" style={{ display: 'inline-block', position: 'relative' }} className='basis-1/2 justify-center  mx-3'>
                  <div className='items-center'><img ref={this.imgRef} src={URL.createObjectURL(this.state.image)} /></div>
                  <div style={this.state.box1}></div>
                  <div style={this.state.box2}></div>
                </div>
              </div>


            </div>
          </div>
        )
      }
      else {
        return (<></>);
      }
    };
    const first_page = () => {
      if (!this.state.is_send) {
        return (
          <div className='basic-1/2'>
            <input
              accept="image/*"
              type="file"
              onChange={(e) => this.imageChange(e)}
            />
            {previewimg()}
          </div>
        );
      }
      else {
        return (<></>);
      }
    }
    const grid_images = () => {
      const sampleimg = ['img/2322397.jpg', 'img/2326908.jpg', 'img/2353025.jpg', 'img/2361073.jpg', 'img/2375369.jpg']
      const images = [];
      for (let index = 0; index < 5; index++) {
        images.push((
          <div class="w-full rounded">
            <img src={sampleimg[index]}
            />
          </div>
        ));
      }
      return images
    }
    const view_result_screen = () => {
      if (this.state.is_retrieve) {
        return (
          <div>
            <div>
              <h2 className="text-2xl font-bold items-center flex flex-col" >Input</h2>
              <div class='flex justify-center '>
                <div class="w-60 rounded">
                  <img src="2354987.jpg"
                    alt="image" />
                </div>
              </div>

            </div>
            <h2 className="text-2xl font-bold items-center flex flex-col mt-4">Result</h2>
            <div class="overflow-y-scroll">
              <div class="grid grid-cols-5 gap-2 mx-auto">
                {grid_images()}
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <button onClick={() => this.backFirstPage()} style={styles.submit} className="rounded-lg my-3">
                Come Back!
              </button>
            </div>
          </div>
        )
      }
      else {
        return (
          <></>
        )
      }
    }
    const upload_nav = () => {
      if (!this.state.is_send) {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-900 bg-white p-6	rounded-lg">
          Upload Image
        </a>
        );
      } 
      else {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 p-6">
          Upload Image
        </a>
        );    
      }
    }
    const interaction_nav = () => {
      if (this.state.is_send && !this.state.is_retrieve) {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-900 bg-white p-6	rounded-lg">
          Interaction
        </a>
        );
      } 
      else {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 p-6">
          Interaction
        </a>
        );    
      }
    }
    const retrieve_nav = () => {
      if (this.state.is_retrieve) {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-900 bg-white p-6	rounded-lg">
          Retrieval Results
        </a>
        );
      } 
      else {
        return (
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 p-6">
          Retrieval Results
        </a>
        );    
      }
    }
    return (
      <>
        <div className='space-y-10'>
          <nav class="flex items-center justify-center flex-wrap bg-teal-500 p-1">
                {upload_nav()}
                {interaction_nav()}
                {retrieve_nav()}
          </nav>
          <div className='flex flex-col items-center space-y-10'>
            {first_page()}
            {view_scene_graph()}
            {view_result_screen()}
          </div>

        </div>
      </>
    );
  }
}

export default App;


// Just some styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  preview: {
    display: "flex",
    flexDirection: "column",
  },
  image: { maxWidth: "100%", maxHeight: 320 },
  delete: {
    cursor: "pointer",
    padding: 15,
    background: "red",
    color: "white",
    border: "none",
  },
  submit: {
    cursor: "pointer",
    padding: 15,
    background: "green",
    color: "white",
    border: "none",
  },
};