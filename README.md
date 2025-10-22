# AI-Powered SEO Automation System

A comprehensive SEO automation platform that connects WordPress, Google Business Profile, SEMrush, Google Analytics 4, and Looker Studio into one seamless workflow. This system automatically transforms client content uploads into optimized SEO content, monitors performance, and triggers re-optimization when rankings drop.

## 🚀 Features

### Core Automation Features
- **AI Content Generation**: OpenAI-powered blog post and GBP content creation
- **Multi-Platform Publishing**: Automatic publishing to WordPress and Google Business Profile
- **Keyword Monitoring**: Real-time ranking tracking with SEMrush integration
- **Performance Analytics**: GA4 metrics collection and analysis
- **Re-optimization Triggers**: Automatic content updates when rankings decline
- **Schema Markup**: JSON-LD structured data generation for SEO
- **Looker Studio Reports**: Automated dashboard updates and monthly reporting

### Supported Integrations
- ✅ WordPress REST API (posts, portfolio, media uploads)
- ✅ Google Business Profile API (posts, photos, reviews)
- ✅ SEMrush API (keyword tracking, domain analytics)
- ✅ Google Analytics 4 (performance metrics, real-time data)
- ✅ OpenAI API (content generation, re-optimization)
- ✅ Looker Studio (automated reporting dashboards)

## 🏗️ Architecture

### Database Schema (Prisma)
```sql
- User (authentication)
- Client (business profiles with API keys)
- Automation (content processing jobs)
- BlogPost (generated content)
- Keyword (ranking tracking)
- Analytics (performance metrics)
- ApiKey (service credentials)
```

### Workflow Engine
- **YAML Configuration**: Client-specific automation settings
- **Python Automation Script**: Command-line workflow execution
- **TypeScript Automation Engine**: Server-side processing
- **Cron Scheduler**: Automated task execution

## 📋 Prerequisites

- Node.js 18+
- Python 3.8+
- SQLite (or PostgreSQL/MySQL)
- WordPress site with REST API enabled
- Google Business Profile API access
- SEMrush API key
- Google Analytics 4 property
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/HTS-CEO/MCP-YAML---SOP-enable-AI-SEO-automation
cd seo-dashboard
npm install
pip install -r requirements.txt
```

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 3. Environment Configuration
Create `.env.local`:
```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-key"
# Add other API keys as needed
```

### 4. Configure Clients
Edit `config/workflow.yaml` with client information and API keys.

### 5. Start the Application
```bash
npm run dev
```

### 6. Run Automation Scripts
```bash
# Process a content upload
python scripts/automation-workflow.py --client client_001 --upload upload.json

# Run scheduled automations
python scripts/automation-workflow.py --schedule

# Generate monthly report
python scripts/automation-workflow.py --client client_001
```

## 📖 Usage Examples

### Content Upload Processing
```javascript
import { AutomationEngine } from './lib/automation-engine'

const engine = new AutomationEngine({
  clientId: 'client_001',
  wordpressEnabled: true,
  gbpEnabled: true,
  semrushEnabled: true,
  ga4Enabled: true,
  reoptimizationEnabled: true
})

const result = await engine.processUpload({
  type: 'photo',
  title: 'New Construction Project',
  description: 'Completed residential renovation in Springfield',
  service: 'Home Renovation',
  location: 'Springfield, IL',
  filePath: '/path/to/image.jpg'
})
```

### Monthly Report Generation
```javascript
const report = await engine.generateMonthlyReport()
console.log('Monthly SEO Report:', report.reportData)
```

## 🔧 API Reference

### WordPress Integration
```typescript
import { createWordPressPost, uploadWordPressMedia } from './lib/wordpress'

// Create blog post
const postResult = await createWordPressPost(
  'https://example.com',
  'api-key',
  {
    title: 'SEO Title',
    content: 'Full content...',
    excerpt: 'Meta description',
    categories: [1, 2]
  }
)

// Upload media
const mediaResult = await uploadWordPressMedia(
  'https://example.com',
  'api-key',
  imageBuffer,
  'filename.jpg',
  'Alt text for SEO'
)
```

### Google Business Profile
```typescript
import { createGBPPost, uploadGBPPhoto } from './lib/gbp'

// Create GBP post
const gbpResult = await createGBPPost(
  'business-id',
  'access-token',
  {
    title: 'Business Update',
    summary: 'Short summary for GBP',
    hashtags: ['construction', 'renovation'],
    callToAction: 'https://example.com'
  }
)
```

### SEMrush Integration
```typescript
import { fetchSEMrushKeywords, trackKeywordRankings } from './lib/semrush'

// Get domain keywords
const keywords = await fetchSEMrushKeywords('api-key', 'example.com')

// Track specific keywords
const rankings = await trackKeywordRankings('api-key', 'example.com',
  ['keyword1', 'keyword2'])
```

## ⚙️ Configuration

### YAML Workflow Configuration
```yaml
clients:
  client_001:
    name: "ABC Construction"
    website: "https://abcconstruction.com"
    wordpress_url: "https://abcconstruction.com"
    wordpress_api_key: "${WORDPRESS_API_KEY}"
    gbp_business_id: "123456789"
    gbp_access_token: "${GBP_ACCESS_TOKEN}"
    semrush_api_key: "${SEMRUSH_API_KEY}"
    ga4_property_id: "123456789"
    automation:
      auto_publish_wordpress: true
      auto_publish_gbp: true
      auto_reoptimize: true
      monthly_reports: true
```

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# AI Content Generation
OPENAI_API_KEY="sk-..."

# Client API Keys (use environment variables for security)
WORDPRESS_API_KEY_CLIENT_001="wp_key_123"
GBP_ACCESS_TOKEN_CLIENT_001="gbp_token_456"
SEMRUSH_API_KEY_CLIENT_001="semrush_key_789"
GA4_ACCESS_TOKEN_CLIENT_001="ga4_token_012"

# Email/Slack Notifications
EMAIL_USERNAME="noreply@seoautomation.com"
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
```

## 🔄 Automation Workflows

### Content Creation Flow
1. **Upload Reception**: Client uploads photo/testimonial/project notes
2. **AI Content Generation**: OpenAI creates SEO-optimized blog post
3. **Schema Markup**: Generate JSON-LD structured data
4. **WordPress Publishing**: Auto-publish blog post with schema
5. **GBP Cross-Posting**: Create condensed post for Google Business Profile
6. **Database Storage**: Store all generated content and metadata

### Monitoring & Re-optimization Flow
1. **Daily Ranking Checks**: SEMrush API fetches current keyword positions
2. **Threshold Analysis**: Compare with previous rankings
3. **Re-optimization Trigger**: If ranking drops > 5 positions
4. **Content Update**: AI re-optimizes existing content
5. **Republishing**: Update WordPress post with improved content

### Reporting Flow
1. **Data Collection**: Gather GA4, SEMrush, GBP metrics
2. **Report Generation**: Compile monthly performance report
3. **Dashboard Update**: Push data to Looker Studio
4. **Notification**: Email/Slack delivery to client

## 📊 Dashboard Features

### Executive Summary
- Overall SEO performance score
- Key KPIs with month-over-month changes
- Top performing keywords and content

### Organic Search Performance
- Sessions, users, page views trends
- Top landing pages analysis
- Organic traffic source breakdown

### Keyword Rankings
- Current vs previous period rankings
- Ranking distribution (Top 3, 4-10, 11-20, etc.)
- Keywords requiring attention

### Content Performance
- Publishing frequency and consistency
- Top performing blog posts
- Content engagement metrics

### Local SEO (GBP)
- Profile views and actions
- Review response metrics
- Photo upload activity

## 🛠️ Development

### Project Structure
```
├── app/                    # Next.js application
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   └── components/       # React components
├── lib/                   # Core business logic
│   ├── automation-engine.ts
│   ├── wordpress.ts
│   ├── gbp.ts
│   ├── semrush.ts
│   ├── ga4.ts
│   ├── openai.ts
│   ├── schema-generator.ts
│   └── cron-scheduler.ts
├── scripts/              # Automation scripts
│   └── automation-workflow.py
├── config/               # Configuration files
│   └── workflow.yaml
├── prisma/               # Database schema
└── README.md
```

### Adding New Integrations
1. Create integration module in `lib/`
2. Add API functions with error handling
3. Update workflow configuration
4. Add to automation engine
5. Test integration thoroughly

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test automation workflows
python scripts/test-workflows.py
```

## 🔒 Security

- API keys stored as environment variables
- Database encryption for sensitive data
- Rate limiting on all API calls
- Input validation and sanitization
- Audit logging for all automation actions

## 📈 Monitoring & Logging

- Comprehensive error handling and logging
- Performance metrics collection
- API usage tracking
- Automation success/failure rates
- Real-time dashboard monitoring

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
```bash
# Production environment
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
# Configure all API keys
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit pull request

---

**Built with ❤️ for SEO automation excellence**
