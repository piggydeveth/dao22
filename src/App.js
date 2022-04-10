import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";
import { ReactPainter } from "react-painter";
const { NFTStorage, File, Blob } = require("nft.storage");
const NFT_STORAGE_TOKEN = "";
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
              alt=""
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
      return;
    }

    try {
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
            try {
              const cid = await client.store({
                image: new File([gifSource[1]], "roo_gif", {
                  type: gifSource[1].type,
                }),
                name: "my-roo-gif",
                description: "the coolest roo art there is",
              });
              console.log(cid);
            } catch (e) {
              console.log(e);
            }
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
