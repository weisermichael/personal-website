# AGENTS.md - Frontend

Guidelines for AI coding agents working on the frontend.

## Project Overview

Static resume website served from S3 via CloudFront. Uses vanilla HTML/CSS/JavaScript with a visitor counter that fetches from a Lambda Function URL.

## Build/Deploy Commands

```bash
# Local preview (requires local server for CORS)
python -m http.server 8000
# Or use Live Server VS Code extension

# Deploy to S3
aws s3 sync . s3://YOUR-BUCKET-NAME --acl private --delete

# Invalidate CloudFront cache after deployment
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## Testing

- No automated tests configured
- Manual testing: Open index.html and verify visitor counter updates
- Test mobile responsiveness in browser DevTools

## Code Style Guidelines

### JavaScript
```javascript
// Use const/let, never var
const counter = document.querySelector('.counter-number');

// Async/await for fetch (preferred over .then chains)
async function updateCounter() {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

// Single quotes for strings
```

- Vanilla JS only (no frameworks/libraries)
- Keep scripts minimal and focused
- Handle fetch errors gracefully

### HTML
- Semantic HTML5 elements (`<header>`, `<section>`, `<footer>`)
- Classes use hyphen-case: `.counter-number`, `.education-item`
- Scripts at end of body
- External stylesheets in `css/`, scripts in `js/`

### CSS
```css
/* Lowercase selectors, hyphen-case classes */
.counter-number {
    font-weight: bold;
}

/* Group related styles */
header h1 {
    margin: 0;
    font-size: 2.5rem;
}
```

- 4-space indentation (consistent with existing)
- One selector per line for multiple selectors
- Space after colon in properties

## File Structure

```
frontend/
├── index.html      # Main page
├── css/
│   └── style.css   # Styles
└── js/
    └── script.js   # Visitor counter logic
```

## Important Notes

1. **Lambda URL is dynamically injected** during CI/CD via `sed`
2. The placeholder URL in script.js is replaced at deploy time
3. Do NOT hardcode the Lambda URL - keep the placeholder pattern
4. Counter fetch happens on page load via `updateCounter()` call
