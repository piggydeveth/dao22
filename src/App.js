import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";
import { ReactPainter } from "react-painter";

const catPic = `data:image/jpeg;base64,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`;

function App() {
  const [picSourceNames, setPicSourceNames] = useState([]);
  const [picSources, setPicSources] = useState([]);
  const [gifSource, setGifSource] = useState("");
  const [ffmpeg, setFFMPEG] = useState(null);
  const [imgDownload, setImgDownload] = useState("");

  useEffect(() => {
    const loadFFMPEG = async () => {
      const ffmpeg = createFFmpeg({
        log: true,
      });
      setFFMPEG(ffmpeg);
      try {
        await ffmpeg.load();
      } catch (e) {
        console.log(e);
      }
    };
    loadFFMPEG();
  }, []);

  const fileToUrl = (file) => {
    const url = window.URL || window.webkitURL;
    try {
      return url.createObjectURL(file);
    } catch (e) {
      return "";
    }
  };
  // add button to save last image on canvas
  // add button to add another onion frame
  const Drawable = () => (
    <ReactPainter
      width={300}
      height={300}
      onSave={async (blob) => {
        let fName = `f${
          picSources.length > 99
            ? picSources.length
            : picSources.length > 9
            ? `0${picSources.length}`
            : `00${picSources.length}`
        }.png`;
        console.log(blob.type);
        let fileAddr = fileToUrl(blob);
        console.log(fileAddr);
        ffmpeg.FS("writeFile", fName, await fetchFile(fileAddr));

        setImgDownload(fileAddr);
        setPicSourceNames((arr) => [...arr, fName]);
        setPicSources((arr) => [...arr, [fileAddr, blob]]);
      }}
      render={({ triggerSave, canvas, imageDownloadUrl }) => (
        <div>
          <button onClick={triggerSave}>Save Canvas</button>
          {imgDownload ? (
            <a href={imgDownload} download>
              Download
            </a>
          ) : null}
          <div
            style={{
              position: "relative",
            }}
          >
            <img
              style={{
                position: "absolute",
                zIndex: "-10",
                opacity: "10%",
              }}
              src={
                picSources.length ? picSources[picSources.length - 1][0] : ""
              }
            />
            {canvas}
          </div>
        </div>
      )}
    />
  );

  const setSource = async () => {
    if (!ffmpeg.isLoaded()) {
      console.log("not loaded1");
      // setTimeout(setSource, 20);
      return;
    }

    try {
      // await ffmpeg.run(
      //   // ffmpeg -f image2 -framerate 1 -i linear%d.jpg -vf scale=531x299 out.gif
      //   "-f",
      //   "image2",
      //   "-framerate",
      //   "1",
      //   "-i",
      //   "f%3d.jpg",
      //   "-vf",
      //   "scale=531x299",
      //   "test.gif"
      // );
      // await ffmpeg.run(
      //   // this works too, wxcept the first frame carries over to the second one. and you have to use 2 ffmpeg commands
      //   // ffmpeg -i giff%d.png -vf palettegen=reserve_transparent=1 palette.png
      //   // ffmpeg -framerate 1 -i giff%d.png -i palette.png -lavfi paletteuse=alpha_threshold=128 -gifflags  treegif.gif
      //   "-framerate",
      //   "1",
      //   "-i",
      //   "f%3d.png",
      //   "-i",
      //   "palette.png",
      //   "-lavfi",
      //   "paletteuse=alpha_threshold=128",
      //   "-gifflags",
      //   "-offsetting",
      //   "test.gif"
      // );

      await ffmpeg.run(
        // since png transparent backgrounds and however ffmpeg creates gifs doesn't, we have to convert all transparent color to white.
        // we could also add a background to the canvas, or change the background color since it defaults to transparent
        // ffmpeg -f image2 -framerate 1 -i giff%d.png -vf "format=yuva444p,geq='if(lte(alpha(X,Y),16),255,p(X,Y))':'if(lte(alpha(X,Y),16),128,p(X,Y))':'if(lte(alpha(X,Y),16),128,p(X,Y))'" out.gif
        "-f",
        "image2",
        "-framerate",
        "1",
        "-i",
        "f%3d.png",
        "-vf",
        "format=yuva444p,geq='if(lte(alpha(X,Y),16),255,p(X,Y))':'if(lte(alpha(X,Y),16),128,p(X,Y))':'if(lte(alpha(X,Y),16),128,p(X,Y))'",
        "test.gif"
      );

      const data = ffmpeg.FS("readFile", "test.gif");
      console.log("data: ", data);
      setGifSource(
        URL.createObjectURL(new Blob([data.buffer], { type: "image/gif" }))
      );
      console.log(data.buffer);
    } catch (e) {
      console.log(e, "couldn't make gif");
    }
  };

  return (
    <div className="App">
      <button
        onClick={() => {
          console.log("click");
          setSource();
        }}
      >
        click me
      </button>
      <>
        {/* {picSources.map((s, i) => (
          <img key={i} src={s} alt="" />
        ))} */}
      </>

      <img src={gifSource} alt="" />

      <Drawable />
    </div>
  );
}

export default App;

// import React, { useState } from "react";
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
// import "./App.css";
// import { file } from "./file.js";

// function App() {
//   const [videoSrc, setVideoSrc] = useState("");
//   const [message, setMessage] = useState("Click Start to transcode");
//   const ffmpeg = createFFmpeg({
//     log: true,
//   });
//   const doTranscode = async () => {
//     setMessage("Loading ffmpeg-core.js");
//     await ffmpeg.load();
//     setMessage("Start transcoding");
//     ffmpeg.FS("writeFile", "test.avi", await fetchFile(file.djikstra));
//     await ffmpeg.run("-i", "test.avi", "test.mp4");
//     setMessage("Complete transcoding");
//     const data = ffmpeg.FS("readFile", "test.mp4");
//     setVideoSrc(
//       URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
//     );
//   };
//   return (
//     <div className="App">
//       <p />
//       <video src={videoSrc} controls></video>
//       <br />
//       <button onClick={doTranscode}>Start</button>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default App;
