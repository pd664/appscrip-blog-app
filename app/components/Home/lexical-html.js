
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $createTextNode, $createParagraphNode, $getRoot, $createLineBreakNode, $createListNode } from "lexical";

// Function to recursively create Lexical nodes from lexicalData
const createLexicalNodesFromData = (nodeData) => {
  switch (nodeData.type) {
    case "text":
      const textNode = $createTextNode(nodeData.text);
      if (nodeData.format) textNode.setFormat(nodeData.format);
      if (nodeData.style) textNode.setStyle(nodeData.style);
      return textNode;

    case "paragraph":
      const paragraphNode = $createParagraphNode();
      if (nodeData.children) {
        nodeData.children.forEach((child) => {
          const childNode = createLexicalNodesFromData(child);
          paragraphNode.append(childNode);
        });
      }
      return paragraphNode;

    case "linebreak":
      return $createLineBreakNode();

    case "list":
      // Create the list node based on the listType (ordered, unordered, or check)
      const listNode = $createListNode('bullet' || 'bullet'); // default to 'bullet' if no format provided

      if (nodeData.children) {
        nodeData.children.forEach((listItemData) => {
          // Create each list item as a paragraph (can be modified as needed)
          const listItemNode = $createParagraphNode();
          listItemData.children.forEach((child) => {
            const childNode = createLexicalNodesFromData(child);
            listItemNode.append(childNode);
          });
          listNode.append(listItemNode);
        });
      }
      return listNode;

    case "link":
      // Handle the link node
      const linkNode = $createLinkNode(nodeData.href);
      if (nodeData.children) {
        nodeData.children.forEach((child) => {
          const childNode = createLexicalNodesFromData(child);
          linkNode.append(childNode);
        });
      }
      return linkNode;

    default:
      throw new Error(`Unsupported node type: ${nodeData.type}`);
  }
};

const convertLexicalDataToHtml = (lexicalData) => {
  try {
    const editor = createEditor();
    let html = "";

    editor.update(() => {
      const root = $getRoot();
      root.clear(); // Clear the root before appending nodes

      if (lexicalData.root?.children) {
        lexicalData.root.children.forEach((nodeData) => {
          const node = createLexicalNodesFromData(nodeData);
          root.append(node);
        });
      }

      html = $generateHtmlFromNodes(editor, null); // Generate HTML from Lexical nodes
    });

    return html;
  } catch (error) {
    console.error("Error converting Lexical data to HTML:", error);
    return "";
  }
};

function parseContentToHTMLJSON(data) {
  try {
    const parsedContent = JSON.parse(data.content);

    const processNode = (node) => {
      const result = { type: node.type };

      switch (node.type) {
        case "text":
          result.text = node.text || "";
          result.format = node.format || 0;
          result.style = node.style || "";
          break;
        case "paragraph":
        case "root":
          result.children = node.children?.map(processNode) || [];
          break;
        default:
          console.warn(`Unsupported node type during parsing: ${node.type}`);
      }

      return result;
    };

    if (!parsedContent.root) {
      console.error("Invalid content structure: missing root node.");
      return null;
    }

    return processNode(parsedContent.root);
  } catch (error) {
    console.error("Error parsing content to HTML JSON:", error);
    return null;
  }
}

function dbToLexicalData(dbData) {
    console.log("lexical", dbData.content)
  try {
    return JSON.parse(dbData);
  } catch (error) {
    console.error("Error transforming database data:", error);
    throw new Error(`Failed to transform database data: ${error.message}`);
  }
}

export { convertLexicalDataToHtml, parseContentToHTMLJSON, dbToLexicalData };
