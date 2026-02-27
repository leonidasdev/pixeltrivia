# API Testing Guide for /api/quiz/advanced

## Environment Setup
1. Add your OpenRouter API key to `.env.local`:
   ```
   OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
   ```

2. Restart the development server to load the environment variables

## Example API Call

### Request
```bash
curl -X POST http://localhost:3000/api/quiz/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "filesSummary": "This document covers the basics of JavaScript programming, including variables, functions, arrays, and objects. It explains how to declare variables using let, const, and var. Functions can be declared using function declarations or arrow functions. Arrays are ordered lists of items that can store multiple values.",
    "numQuestions": 5,
    "format": "short",
    "timeLimit": 30
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "Which keyword is recommended for declaring variables in modern JavaScript?",
        "options": ["var", "let", "const", "function"],
        "answer": 2
      },
      {
        "question": "What are arrays in JavaScript?",
        "options": ["Single values only", "Ordered lists of items", "Only text strings", "Function declarations"],
        "answer": 1
      }
    ],
    "metadata": {
      "numQuestions": 5,
      "format": "short",
      "timeLimit": 30
    }
  }
}
```

## Security Features Implemented

1. **Input Sanitization**:
   - Removes markdown syntax, role-play signals
   - Strips HTML/script tags and control characters
   - Truncates to max 3000 characters

2. **Prompt Injection Prevention**:
   - Strict prompt structure
   - Clear instructions to ignore embedded commands
   - Consistent output format requirements

3. **API Security**:
   - Environment variable protection for API keys
   - Proper HTTP headers and referer
   - Rate limiting awareness
   - Comprehensive error handling

4. **Input Validation**:
   - Parameter bounds checking
   - Type validation
   - Fallback to safe defaults

## Error Handling

The API handles various error scenarios:
- Invalid JSON input (400)
- Missing/empty filesSummary (400)
- API authentication failure (500)
- Rate limiting (429)
- AI service unavailable (503)
- Invalid AI response (502)
- Internal server errors (500)

## Testing in Browser

You can test the integration by:
1. Navigate to the game mode selection
2. Choose "Advanced Game"
3. Upload some test files (or proceed without files)
4. Configure your settings
5. Select "Play Solo"
6. Click "Start Game" to trigger the API call

The response will be logged to the browser console and stored in localStorage for the game to use.
