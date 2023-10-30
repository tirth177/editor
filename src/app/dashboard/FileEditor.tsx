"use client";

import React, { useState, ChangeEvent } from "react";
import Docxtemplater from "docxtemplater";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PizZip from "pizzip";

function FileEditor() {
  const [content, setContent] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files?.[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;

      let zip = new PizZip();
      let zipBuff = zip.load(arrayBuffer);

      //   let zipBuff = await zip.loadAsync(arrayBuffer);

      const doc = new Docxtemplater().loadZip(zipBuff);

      const extractedContent = doc.getFullText();

      setContent(extractedContent);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = () => {
    const doc = new Docxtemplater();
    doc.loadZip(new PizZip());
    doc.setData({ content });

    try {
      doc.render();
      const generatedDocx = doc.getZip().generate({ type: "blob" });

      // Download the generated Docx file
      const downloadLink = document.createElement("a");
      const url = URL.createObjectURL(generatedDocx);
      downloadLink.href = url;
      downloadLink.download = "edited_file.docx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error generating Docx file:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <ReactQuill value={content} onChange={handleContentChange} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default FileEditor;
