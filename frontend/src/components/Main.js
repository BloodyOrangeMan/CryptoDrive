import { useState, useEffect } from "react";
import axios from "axios";

import File from "./File";
import DevCard from "./DevCard";
import { DevTeam } from "./DevTeam";
import Key from "./Key";

require("dotenv").config();

const Main = ({ sideBarOption, reRender, setReRender }) => {
  // UseEffect
  useEffect(() => {
    getFiles();
    getKeys();
  }, [reRender]);

  // State Variables
  const [files, setFiles] = useState();
  const [keys, setKeys] = useState();

  // Functions
  const getFiles = () => {
    fetch(`api/file/`, {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files);
      });
  };

  const getKeys = () => {
    axios
      .get("api/key/", {
        withCredentials: true,
      })
      .then((res) => {
        setKeys(res.data.keys);
      });
  };

  switch (sideBarOption) {
    case 0:
      return (
        <div className="main">
          {files ? (
            files.map((file, i) => (
              <File
                metaData={file.metadata.info}
                reRender={reRender}
                setReRender={setReRender}
                key={i}
                keyData={keys} 
              />
            ))
          ) : (
            <div>
              <h1>
                Currently you haven't uploaded any files please upload one by
                clicking on the upload button.
              </h1>
            </div>
          )}
        </div>
      );
    case 1:
      return (
        <Key 
            keyData={keys} 
            reRender={reRender} 
            setReRender={setReRender}/>
            
      );
    case 2:
      return (
        <div className="dev-team">
          {DevTeam.map((team) => (
            <DevCard team={team} key={team.id} />
          ))}
        </div>
      );
  }
};
export default Main;
