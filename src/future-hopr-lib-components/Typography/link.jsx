import styled from '@emotion/styled';

const Link = styled.a`
  .openIcon {
    width: 1em;
    height: 1em;
    display: inline-block;
    line-height: 1em;
    -webkit-flex-shrink: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    color: currentColor;
    vertical-align: middle;
    //  border-color: var(--chakra-colors-gray-200);
    word-wrap: break-word;
  }
`;

function Typography({ className = '', href, text, openIcon }) {
  return (
    <Link
      className={`Typography--link ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {text}
      {openIcon && (
        <svg
          viewBox="0 0 24 24"
          focusable="false"
          className="openIcon"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <path d="M15 3h6v6"></path>
            <path d="M10 14L21 3"></path>
          </g>
        </svg>
      )}
    </Link>
  );
}

export default Typography;
