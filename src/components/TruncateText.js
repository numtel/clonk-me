import React, { useState } from 'react';
import Linkify from 'react-linkify';
import {Link} from 'react-router-dom';

import {TokenReadable} from './ParentButton.js';

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
  const internalLinks = truncatedWords
      .join(' ')
      .split('https://clonk.me/nft/')
      .map((value, index) => {
        if(index > 0) {
          const splitPos = value.search(/\s/);
          const linkParts = value.substr(0, splitPos).split('/');
          return [
            (<Link to={`/nft/${value.substr(0, splitPos)}`}>
              <TokenReadable chainId={linkParts[0]} collection={linkParts[1]} tokenId={linkParts[2]} />
            </Link>),
            value.substr(splitPos)
          ];
        }
        return value;
      });

  return (
    <>
      <Linkify>{internalLinks}</Linkify>
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
