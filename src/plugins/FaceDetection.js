/* eslint-disable no-unused-vars */

import pico from './Pico';

export default {
  install(Vue) {
    Vue.prototype.$pico = pico;
    Vue.prototype.$faceDetector = {
      facefinder_classify_region: (r, c, s, pixels, ldim) => -1.0,
      update_memory: pico.instantiate_detection_memory(5),
      async initialize(cascadeUrl) {
        try {
          const cascadeData = await fetch(cascadeUrl);
          const cascadeDataBuffer = await cascadeData.arrayBuffer();

          const bytes = new Int8Array(cascadeDataBuffer);
          this.facefinder_classify_region = pico.unpack_cascade(bytes);
          console.log('* facefinder loaded');
        } catch {
          console.log('error during loading facefinder');
        }
      },
      processImage(ctx, video) {
        ctx.drawImage(video, 0, 0);
				var rgba = ctx.getImageData(0, 0, 640, 480).data;
				const image = {
					"pixels": rgba_to_grayscale(rgba, 480, 640),
					"nrows": 480,
					"ncols": 640,
					"ldim": 640
				}
				const params = {
					"shiftfactor": 0.1,
					"minsize": 100,
					"maxsize": 1000,
					"scalefactor": 1.1
        }

        let dets = pico.run_cascade(image, this.facefinder_classify_region, params);
        dets = this.update_memory(dets);
        dets = pico.cluster_detections(dets, 0.2);

        // for(let i=0; i<dets.length; ++i)
        //   if(dets[i][3]>50.0)
        //   {
        //     ctx.beginPath();
        //     ctx.arc(dets[i][1], dets[i][0], dets[i][2]/2, 0, 2*Math.PI, false);
        //     ctx.lineWidth = 3;
        //     ctx.strokeStyle = 'red';
        //     ctx.stroke();
        //   }

        if (dets.length === 1) {
          return dets[0];
        }
        return null;
      }
    }
  },
}

function rgba_to_grayscale(rgba, nrows, ncols) {
  var gray = new Uint8Array(nrows*ncols);
  for(var r=0; r<nrows; ++r)
    for(var c=0; c<ncols; ++c)
      // gray = 0.2*red + 0.7*green + 0.1*blue
      gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
  return gray;
}