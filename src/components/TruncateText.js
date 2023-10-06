import React, { useState } from 'react';

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
      {truncatedWords.join(' ')}
      {words.length > maxWords && (<>
        &nbsp;<a href="#" onClick={toggleTruncate}>
          {isTruncated ? '...show more' : 'show less'}
        </a>
      </>)}
    </>
  );
};


