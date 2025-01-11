import convertLexicalDataToHtml from './lexical-html';

const LexicalDataPage = ({ lexicalData }) => {
  const html = convertLexicalDataToHtml(lexicalData);
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export async function fetchingData(context) {
  const lexicalData = await fetchYourDataFromDB(); 
  return {
    props: {
      lexicalData,
    },
  };
}

export default LexicalDataPage;