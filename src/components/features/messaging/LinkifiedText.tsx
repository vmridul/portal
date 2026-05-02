import React from "react";

interface LinkifiedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]*\.(?:com|net|org|io|co|ai|app|dev|me|uk|ca|in|us|gov|edu|xyz|info|biz)(?:\/[^\s]*)?)/gi;

export const LinkifiedText = React.memo(({ text, className, style }: LinkifiedTextProps) => {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return (
    <div className={className} style={style}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.match(URL_REGEX)) {
          let href = part;
          if (!part.startsWith("http://") && !part.startsWith("https://")) {
            href = `https://${part}`;
          }

          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline break-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        // Otherwise, render it as plain text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
});

LinkifiedText.displayName = "LinkifiedText";
