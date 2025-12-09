import { Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // or any theme you prefer
import { useEffect, useRef } from 'react';

interface StreamingMarkdownProps {
  content: string;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({ content }) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const parseMarkdown = (text: string) => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        const language = line.trim().slice(3);
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
        <Paper
          key={elements.length}
          sx={{
            p: 1.5,
            mb: 2,
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
          elevation={0}
        >
          <pre style={{ margin: 0 }}>
            <code
              style={{ fontFamily: 'monospace' }}
              className={language ? `language-${language}` : ''}
            >
              {codeLines.join('\n')}
            </code>
          </pre>
        </Paper>
      );
        i++;
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <Typography key={elements.length} variant="h4" sx={{ mt: 3, mb: 2 }}>
            {parseInline(line.slice(2))}
          </Typography>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Typography key={elements.length} variant="h5" sx={{ mt: 3, mb: 2 }}>
            {parseInline(line.slice(3))}
          </Typography>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Typography key={elements.length} variant="h6" sx={{ mt: 2, mb: 1 }}>
            {parseInline(line.slice(4))}
          </Typography>
        );
      } else if (line.trim() === '') {
        // Skip empty lines but they separate paragraphs
        i++;
        continue;
      } else {
        // Paragraph - collect consecutive non-empty lines
        const paraLines: string[] = [line];
        i++;
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !lines[i].match(/^#{1,6} /) &&
          !lines[i].trim().startsWith('```')
        ) {
          paraLines.push(lines[i]);
          i++;
        }
        elements.push(
          <Typography key={elements.length} variant="body1" sx={{ mb: 2 }}>
            {parseInline(paraLines.join(' '))}
          </Typography>
        );
        continue;
      }
      i++;
    }

    return elements;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Regex for inline code, bold, italic, links
    const inlineRegex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(__[^_]+__)|(_[^_]+_)|(\[([^\]]+)\]\(([^)]+)\))/g;
    
    let match;
    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > currentIndex) {
        elements.push(text.slice(currentIndex, match.index));
      }

      // Inline code
      if (match[1]) {
        const code = match[1].slice(1, -1);
        elements.push(
          <code
            key={elements.length}
            style={{
              backgroundColor: theme.palette.action.hover,
              padding: '2px 4px',
              borderRadius: 4,
              fontFamily: 'monospace',
            }}
          >
            {code}
          </code>
        );
      }
      // Bold
      else if (match[2] || match[4]) {
        const boldText = match[2] ? match[2].slice(2, -2) : match[4].slice(2, -2);
        elements.push(
          <strong key={elements.length}>{boldText}</strong>
        );
      }
      // Italic
      else if (match[3] || match[5]) {
        const italicText = match[3] ? match[3].slice(1, -1) : match[5].slice(1, -1);
        elements.push(
          <em key={elements.length}>{italicText}</em>
        );
      }
      // Links
      else if (match[6]) {
        elements.push(
          <a
            key={elements.length}
            href={match[8]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.palette.primary.main }}
          >
            {match[7]}
          </a>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(text.slice(currentIndex));
    }

    return elements.length > 0 ? elements : [text];
  };

  return <div ref={containerRef}>{parseMarkdown(content)}</div>;
};

export default StreamingMarkdown;