# AI-Powered Interpretations Setup Guide

## Overview

The Astrology SaaS Platform now supports AI-powered interpretations using OpenAI's GPT-4 API. This provides enhanced, personalized readings that go beyond static templates.

## Prerequisites

- OpenAI API key
- Node.js 18+
- PostgreSQL database
- Existing Astrology SaaS Platform installation

## Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

**Note:** New accounts get free credits. After that, GPT-4 Turbo pricing is:
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

### 2. Configure Backend

Add to `backend/.env`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# AI Cache Configuration
AI_CACHE_TTL=86400
AI_ENABLE_CACHE=true

# AI Usage Tracking
AI_TRACK_USAGE=true
```

**Configuration Options:**

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | Model to use | `gpt-4-turbo-preview` |
| `OPENAI_MAX_TOKENS` | Maximum tokens per response | `2000` |
| `OPENAI_TEMPERATURE` | Creativity (0.0-1.0) | `0.7` |
| `AI_CACHE_TTL` | Cache time-to-live in seconds | `86400` (24 hours) |
| `AI_ENABLE_CACHE` | Enable/disable caching | `true` |
| `AI_TRACK_USAGE` | Enable usage tracking | `true` |

**Alternative Models:**

For faster/cheaper results, consider:
- `gpt-3.5-turbo` - Faster, cheaper ($0.001/1K input, $0.002/1K output)
- `gpt-4` - More accurate, slower
- `gpt-4-turbo` - Best balance (default)

### 3. Run Database Migrations

```bash
cd backend
npm run db:migrate
```

This creates:
- `ai_cache` table for caching results
- `ai_usage` table for tracking usage and costs

**Migration Details:**

```sql
-- ai_cache table
CREATE TABLE ai_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  interpretation_type VARCHAR(50) NOT NULL,
  input_data JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INT DEFAULT 0
);

-- ai_usage table
CREATE TABLE ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  interpretation_type VARCHAR(50) NOT NULL,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_tokens INT NOT NULL,
  estimated_cost DECIMAL(10, 4) NOT NULL,
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Install Dependencies

```bash
cd backend
npm install openai
```

Dependencies required:
- `openai` ^4.0.0
- `crypto` (built-in)
- `pg` (already installed)

### 5. Start Backend

```bash
npm start
```

The AI module will initialize and check:
1. OpenAI API key is valid
2. Database tables exist
3. Cache system is ready

## API Usage

### Endpoints

#### Check AI Status

```http
GET /api/v1/ai/status
```

Response:
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "gpt-4-turbo-preview",
    "cacheEnabled": true,
    "trackingEnabled": true
  }
}
```

#### Generate Natal Interpretation

```http
POST /api/v1/ai/natal
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "planets": [
    {
      "planet": "sun",
      "sign": "aries",
      "degree": 15,
      "house": 1,
      "retrograde": false
    },
    {
      "planet": "moon",
      "sign": "taurus",
      "degree": 10,
      "house": 2,
      "retrograde": false
    }
  ],
  "houses": [
    {
      "house": 1,
      "sign": "aries",
      "degree": 0
    },
    {
      "house": 2,
      "sign": "taurus",
      "degree": 30
    }
  ],
  "aspects": [
    {
      "planet1": "sun",
      "planet2": "moon",
      "type": "trine",
      "orb": 5
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "ai": true,
    "enhanced": {
      "sunInAries": "Bold and pioneering...",
      "moonInTaurus": "Emotionally grounded...",
      "sunTrineMoon": "Harmonious integration..."
    },
    "generatedAt": "2026-02-17T10:30:00Z",
    "model": "gpt-4-turbo-preview",
    "fromCache": false,
    "tokensUsed": 1250
  }
}
```

#### Generate Transit Forecast

```http
POST /api/v1/ai/transit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentTransits": [
    {
      "planet": "Jupiter",
      "type": "conjunction",
      "natalPlanet": "Sun",
      "orb": 3,
      "startDate": "2026-02-01",
      "endDate": "2026-03-15"
    }
  ],
  "forecastType": "weekly"
}
```

#### Generate Compatibility Analysis

```http
POST /api/v1/ai/compatibility
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "chartA": {
    "planets": [...],
    "houses": [...],
    "aspects": [...]
  },
  "chartB": {
    "planets": [...],
    "houses": [...],
    "aspects": [...]
  },
  "relationshipType": "romantic"
}
```

**Relationship Types:**
- `romantic` - Romantic compatibility
- `friendship` - Platonic friendship
- `business` - Business partnership
- `family` - Family relationships

#### Get Usage Statistics

```http
GET /api/v1/ai/usage/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "success": true,
  "data": {
    "totalRequests": 42,
    "totalTokens": 52500,
    "totalCost": 1.58,
    "breakdown": {
      "natal": 25,
      "transit": 12,
      "compatibility": 5
    },
    "monthlyStats": {
      "currentMonth": {
        "requests": 15,
        "tokens": 18750,
        "cost": 0.56
      }
    }
  }
}
```

## Frontend Integration

### Using the AI Service

```typescript
import { useAIInterpretation } from '../hooks/useAIInterpretation';

function MyComponent() {
  const { generateNatal, isAvailable, isLoading, error } = useAIInterpretation();

  const handleGenerate = async () => {
    try {
      const interpretation = await generateNatal({
        planets: [...],
        houses: [...],
        aspects: [...]
      });

      console.log('AI Interpretation:', interpretation);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={!isAvailable || isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate AI Interpretation'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Using the AI Toggle Component

```typescript
import { AIInterpretationToggle } from '../components';

function AnalysisPage() {
  const [aiInterpretation, setAIInterpretation] = useState(null);

  return (
    <div>
      <AIInterpretationToggle
        chartData={chartData}
        onInterpretationGenerated={setAIInterpretation}
      />

      {aiInterpretation && (
        <AIInterpretationDisplay interpretation={aiInterpretation} />
      )}
    </div>
  );
}
```

## Cost Management

### Understanding Costs

**GPT-4 Turbo Pricing:**
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

**Typical Usage:**

| Interpretation Type | Input Tokens | Output Tokens | Est. Cost |
|---------------------|--------------|---------------|-----------|
| Natal (basic) | ~800 | ~1,200 | $0.04 |
| Natal (detailed) | ~1,000 | ~2,000 | $0.07 |
| Transit (daily) | ~500 | ~800 | $0.03 |
| Transit (monthly) | ~700 | ~1,500 | $0.05 |
| Compatibility | ~1,200 | ~2,500 | $0.09 |

### Cost Optimization

**1. Enable Caching**
```bash
AI_ENABLE_CACHE=true
AI_CACHE_TTL=86400  # 24 hours
```

Benefits:
- Repeated requests use cached results
- 90%+ cache hit rate for common charts
- Dramatically reduces API calls

**2. Use Cheaper Models**
```bash
OPENAI_MODEL=gpt-3.5-turbo  # 10x cheaper
```

Trade-offs:
- Faster response
- Less nuanced interpretations
- Good for simple queries

**3. Adjust Token Limits**
```bash
OPENAI_MAX_TOKENS=1000  # Reduce output length
```

**4. Monitor Usage Regularly**
```bash
curl GET /api/v1/ai/usage/stats -H "Authorization: Bearer YOUR_TOKEN"
```

**5. Set User Limits**

Implement in your application:
```typescript
// Example: 50 requests per month per user
const userLimit = 50;
const currentUsage = await getUserUsage(userId);

if (currentUsage >= userLimit) {
  throw new Error('Monthly AI limit reached');
}
```

## Troubleshooting

### AI Not Available

**Symptoms:**
- Status endpoint returns `available: false`
- All requests return rule-based interpretations

**Solutions:**

1. **Check API Key**
```bash
echo $OPENAI_API_KEY  # Should start with "sk-"
```

2. **Verify Key Has Credits**
- Go to https://platform.openai.com/usage
- Check account balance

3. **Check Backend Logs**
```bash
tail -f backend/logs/app.log
```

Look for:
```
ERROR: OpenAI API error: Incorrect API key provided
ERROR: OpenAI quota exceeded
```

4. **Test API Key Manually**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Slow Generation

**Symptoms:**
- Requests taking 10+ seconds
- User timeout errors

**Solutions:**

1. **Enable Caching**
```bash
AI_ENABLE_CACHE=true
AI_CACHE_TTL=86400
```

2. **Reduce Token Limit**
```bash
OPENAI_MAX_TOKENS=1500  # Instead of 2000
```

3. **Use Faster Model**
```bash
OPENAI_MODEL=gpt-3.5-turbo
```

4. **Implement Client-Side Timeout**
```typescript
const timeout = 30000; // 30 seconds
const controller = new AbortController();

setTimeout(() => controller.abort(), timeout);

const response = await fetch('/api/v1/ai/natal', {
  signal: controller.signal
});
```

### High Costs

**Symptoms:**
- Unexpected charges
- Rapid token consumption

**Solutions:**

1. **Check Usage Stats**
```bash
curl GET /api/v1/ai/usage/stats
```

2. **Reduce Cache TTL**
```bash
AI_CACHE_TTL=43200  # 12 hours instead of 24
```

3. **Implement Rate Limiting**
```typescript
// Example: 10 requests per minute per user
const rateLimiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute'
});
```

4. **Use Shorter Prompts**
- Edit prompt templates in `backend/src/modules/ai/prompts/`
- Remove redundant instructions

5. **Set Budget Alerts**
- Go to https://platform.openai.com/usage
- Set up usage alerts

### Cache Not Working

**Symptoms:**
- Same request hits API every time
- `fromCache: false` in all responses

**Solutions:**

1. **Verify Cache Enabled**
```bash
AI_ENABLE_CACHE=true
```

2. **Check Database**
```sql
SELECT COUNT(*) FROM ai_cache;
-- Should be > 0 if caching is working
```

3. **Check Cache TTL**
```sql
SELECT cache_key, expires_at, created_at
FROM ai_cache
ORDER BY created_at DESC
LIMIT 10;
```

4. **Clear Cache Manually**
```sql
DELETE FROM ai_cache WHERE expires_at < NOW();
```

## Monitoring & Maintenance

### Daily Checks

1. **Check API Usage**
```bash
curl GET /api/v1/ai/usage/stats
```

2. **Review Costs**
- Go to OpenAI dashboard
- Review daily spending

3. **Check Error Logs**
```bash
grep "OpenAI" backend/logs/app.log | tail -20
```

### Weekly Maintenance

1. **Clean Expired Cache**
```sql
DELETE FROM ai_cache WHERE expires_at < NOW();
```

2. **Review Usage Patterns**
```sql
SELECT
  interpretation_type,
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_usage
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY interpretation_type;
```

3. **Optimize Cache TTL**
- Adjust based on hit rate
- Balance freshness vs cost

### Monthly Tasks

1. **Generate Cost Report**
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_requests,
  SUM(total_tokens) as total_tokens,
  SUM(estimated_cost) as total_cost
FROM ai_usage
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

2. **Review User Limits**
- Adjust user quotas if needed
- Identify heavy users

3. **Update Prompt Templates**
- Refine based on user feedback
- A/B test variations

## Security Considerations

### API Key Security

1. **Never Commit API Keys**
```bash
# Add to .gitignore
echo ".env.ai" >> .gitignore
echo "OPENAI_API_KEY" >> .gitignore
```

2. **Use Environment Variables**
```bash
# In .env (not committed)
OPENAI_API_KEY=sk-...

# In code
const apiKey = process.env.OPENAI_API_KEY;
```

3. **Rotate Keys Regularly**
- Every 90 days recommended
- Update .env and restart server

### User Data Privacy

1. **No PII in Prompts**
- Sanitize birth data
- Remove identifying information

2. **Cache Expiration**
- Don't cache indefinitely
- Respect user deletion requests

3. **Usage Anonymization**
- Aggregate statistics
- Don't expose individual patterns

## Support

### Documentation
- OpenAI API: https://platform.openai.com/docs
- Prompt Engineering Guide: https://platform.openai.com/docs/guides/prompt-engineering

### Common Issues

See "Troubleshooting" section above.

### Contact

For platform-specific issues:
- GitHub Issues: [your-repo]/issues
- Email: support@your-domain.com

---

**Version:** 1.0.0
**Last Updated:** February 17, 2026
