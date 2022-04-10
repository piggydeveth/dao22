import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";
import { ReactPainter } from "react-painter";
const { NFTStorage, File, Blob } = require("nft.storage");
const NFT_STORAGE_TOKEN = "REPLACE_WITH_REAL_KEY";
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

function App() {
  const [picSourceNames, setPicSourceNames] = useState([]);
  const [picSources, setPicSources] = useState([]);
  const [gifSource, setGifSource] = useState([]);
  const [ffmpeg, setFFMPEG] = useState(null);
  const [imgDownload, setImgDownload] = useState("");
  const [gifDownload, setGifDownload] = useState("");

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
      let gifBlob = new Blob([data.buffer], { type: "image/gif" });
      let gifUrl = URL.createObjectURL(gifBlob);
      setGifSource([gifUrl, gifBlob]);
      setGifDownload(gifUrl);
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
        create gif
      </button>
      {gifDownload ? <a href={gifDownload}>Download Gif</a> : null}
      {gifSource.length ? (
        <button
          onClick={async () => {
            const cid = await client.storeBlob(gifSource[1]);
            console.log(cid);
          }}
        >
          Upload to nft.storage
        </button>
      ) : null}

      <img src={gifSource.length ? gifSource[0] : ""} alt="" />

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
