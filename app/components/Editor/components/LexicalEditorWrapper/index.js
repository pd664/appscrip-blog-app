"use client";

import { useEffect, useState, useCallback } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Box, Divider, Button, Alert, Snackbar } from "@mui/material";
import { MuiContentEditable, placeHolderSx } from "./styles";
import { lexicalEditorConfig } from "../../config/lexicalEditorConfig";
import LexicalEditorTopBar from "../LexicalEditorTopBar";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ImagesPlugin from "../CustomPlugins/ImagePlugin";
import FloatingTextFormatToolbarPlugin from "../CustomPlugins/FloatingTextFormatPlugin";
import TreeViewPlugin from "../CustomPlugins/TreeViewPlugin";

import { useSupabase } from '@/app/components/Editor/hooks/useSupabase';

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { dbToLexicalData, convertLexicalDataToHtml } from '@/app/components/Home/lexical-html';
const editorConfig = {
  namespace: 'MyEditor',
  theme: {
    // Define your theme if necessary
  },
    // or the initial editor stat
};


export default function LexicalEditorWrapper() {
  const { loading, error, editorData, saveContent } = useSupabase();
  const [editorState, setEditorState] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const[title, setTitle] = useState("")
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize editor if there's existing data
  useEffect(() => {
    if (editorData) {
      try {
        const parsedState = editorData
        setEditorState(parsedState);
      } catch (e) {
        console.error('Error parsing editor data:', e);
        showNotification('Error loading saved content', 'error');
      }
    }
  }, [editorData]);

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
console.log("editor", editorState)
  // Enhanced editor state change handler
  const handleEditorStateChange = (editorState) => {
    try {
      // Safely interact with editor state
      editorState.read(() => {
        const editorStateJSON = editorState.toJSON();
        setEditorState(JSON.stringify(editorStateJSON));
      });
    } catch (error) {
      console.error('Error handling editor state change:', error);
      showNotification('Error updating editor state', 'error');
    }
  };
  

  // Save handler
  const handleSave = async () => {
    try {
      if (!editorState) {
        throw new Error('No content to save');
      }
      const lexicalData = dbToLexicalData(editorState);
      console.log("lexical", lexicalData)
      let htmlContent = convertLexicalDataToHtml(lexicalData);
      // Create a save payload with metadata
      const savePayload = {
        content: htmlContent,
        metadata: {
          lastModified: new Date().toISOString(),
          version: '1.0',
          fileAttachments: selectedFile ? [{
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size
          }] : []
        }
      };

      const result = await saveContent(savePayload, selectedFile, title);
      
      if (result.success) {
        showNotification('Content saved successfully', 'success');
        setSelectedFile(null);
      } else {
        throw new Error(result.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error.message, 'error');
    }
  };

  // Get current editor data
  const getEditorData = useCallback(() => {
    return {
      state: editorState,
      hasUnsavedChanges: true, // You can implement change tracking logic
      metadata: {
        lastModified: new Date().toISOString(),
        attachments: selectedFile ? [selectedFile.name] : []
      }
    };
  }, [editorState, selectedFile]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("fileee ", file)
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Store the image data URL
      };
      reader.readAsDataURL(file);
      } else {
        showNotification('Please select an image file', 'error');
      }
    }
  };

  if (loading) {
    return <Box sx={{ p: 2 }}>Loading...</Box>;
  }

  function onChange(editorState) {
    // Call toJSON on the EditorState object, which produces a serialization safe string
    const editorStateJSON = editorState.toJSON();
    // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
    setEditorState(JSON.stringify(editorStateJSON));
  }
  
  
  function MyOnChangePlugin({ onChange }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      return editor.registerUpdateListener(({editorState}) => {
        onChange(editorState);
      });
    }, [editor, onChange]);
    return null;
  }
  
  return (
    <LexicalComposer initialConfig={lexicalEditorConfig}>
      <Box>
  <div className="flex py-5 md:py-10 lg:py-10 w-full">
    <input
      className="w-full p-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
      placeholder="Enter title"
      onChange={(e) => setTitle(e.target.value)}
    />
  </div>
</Box>

      <LexicalEditorTopBar />
      <Divider />

      <Box sx={{ position: "relative", background: "white" }}>
      <RichTextPlugin
        contentEditable={<MuiContentEditable />}
        placeholder={<Box sx={placeHolderSx}>Enter some text...</Box>}
        ErrorBoundary={LexicalErrorBoundary}

        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {/* <TreeViewPlugin /> */}
        <ListPlugin />
        <LinkPlugin />
        <ImagesPlugin captionsEnabled={false} />
        <FloatingTextFormatToolbarPlugin />
        <MyOnChangePlugin onChange={handleEditorStateChange}/>
      </Box>
      {previewImage && (
    <Box sx={{ width: '200px', height: '200px', overflow: 'hidden', borderRadius: '8px' }}>
      <img
        src={previewImage}
        alt="Image Preview"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  )}

      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button component="span" variant="outlined">
            Upload Image
          </Button>
        </label>

        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Save to Database
        </Button>
        {/* <Button 
          onClick={() => console.log(getEditorData())}
          variant="outlined"
        >
          Log Editor Data
        </Button> */}
      </Box>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar> 

    </LexicalComposer>
  );
}

function onChange(editorState) {
  // Call toJSON on the EditorState object, which produces a serialization safe string
  const editorStateJSON = editorState.toJSON();
  // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
  setEditorState(JSON.stringify(editorStateJSON));
}


function MyOnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      onChange(editorState);
    });
  }, [editor, onChange]);
  return null;
}
