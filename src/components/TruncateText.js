import React, { useState } from 'react';
import Linkify from 'react-linkify';

export const TruncateText = ({ text, maxWords }) => {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = (event) => {
    event.preventDefault();
    setIsTruncated(!isTruncated);
  };

  // Split the text into an array of words
  const words = text.split(' ');

  // Create a truncatedWords array containing the first 'maxWords' words
  const truncatedWords = isTruncated ? words.slice(0, maxWords) : words;

  return (
    <>
      <Linkify>{truncatedWords.join(' ')}</Linkify>
      {words.length > maxWords && (<>
        &nbsp;<button className="link" onClick={toggleTruncate}>
          {isTruncated ? '...show more' : 'show less'}
        </button>
      </>)}
    </>
  );
};



function LinkComponent(decoratedHref, decoratedText, key) {
  return (<a href={decoratedHref} target="_blank" rel="noreferrer" key={key}>{decoratedText}</a>);
}
Linkify.defaultProps.componentDecorator = LinkComponent;
