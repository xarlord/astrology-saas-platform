# Deployment Configuration
# Guide for deploying the Astrology SaaS Platform

## Environment Variables

### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/astrology_db
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication
JWT_SECRET=your-production-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Swiss Ephemeris
EPHEMERIS_PATH=./ephemeris
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### Prerequisites
- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 12+
- PM2 (process manager)

#### Deployment Steps

1. **Server Setup**
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2
sudo npm install -g pm2
```

2. **Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE astrology_db;
CREATE USER astrology_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE astrology_db TO astrology_user;
\q
```

3. **Deploy Backend**
```bash
# Clone repository
git clone https://github.com/your-repo/astrology-saas.git
cd astrology-saas/backend

# Install dependencies
npm ci --production

# Run migrations
npm run db:migrate
npm run db:seed

# Start application with PM2
pm2 start npm --name "astrology-api" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

4. **Deploy Frontend**
```bash
cd frontend
npm ci
npm run build

# Serve with nginx or deploy to Vercel/Netlify
# Example: Deploy to Vercel
vercel --prod
```

5. **Configure Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-ForwardedProto $scheme;
    }
}
```

---

### Option 2: Docker Deployment

#### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: astrology_db
      POSTGRES_USER: astrology_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://astrology_user:${POSTGRES_PASSWORD}@postgres:5432/astrology_db
      NODE_ENV: production
      PORT: 3001
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 1h
      JWT_REFRESH_EXPIRES_IN: 7d
    ports:
      - "3001:3001"
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: Cloud Platform (AWS, Render, Railway)

#### AWS ECS Deployment
1. **Push images to ECR**
2. **Create ECS task definition**
3. **Configure load balancer**
4. **Set up RDS PostgreSQL**
5. **Configure environment variables**

#### Render Deployment
1. **Connect GitHub repo**
2. **Select root directories for backend/frontend**
3. **Configure environment variables**
4. **Deploy automatically on push**

#### Railway Deployment
1. **Connect GitHub repo**
2. **Detects Node.js and PostgreSQL automatically**
3. **Review and deploy**

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd backend
          npm ci
          cd ../frontend
          npm ci

      - name: Run tests
        run: |
          cd backend
          npm test
          npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build and push Docker images
        run: |
          # Tag with commit SHA
          SHA=${{ github.sha }}

          # Backend
          docker build -t ${{ secrets.ECR_REGISTRY }}/astrology-backend:$SHA ./backend
          docker push ${{ secrets.ECR_REGISTRY }}/astrology-backend:$SHA

          # Frontend
          docker build -t ${{ secrets.ECR_REGISTRY }}/astrology-frontend:$SHA ./frontend
          docker push ${{ secrets.ECR_REGISTRY }}/astrology-frontend:$SHA

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster astrology-saas --service backend --force-new-deployment --task-definition astrology-backend:$SHA

  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run security scan
        run: |
          npm audit --audit-level=high

      - name: Check for vulnerabilities
        run: |
          npm audit fix
```

---

## Database Migration Strategy

### Production Migration Steps

1. **Backup existing data** (if any)
2. **Review migration files**
3. **Test migrations on staging**
4. **Run production migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. **Verify migrations**

### Rollback Plan
```bash
# If issues occur, rollback
npm run db:rollback
```

---

## Monitoring & Logging

### Application Monitoring (Recommended)

1. **APM Tools:**
   - New Relic
   - DataDog
   - AWS X-Ray

2. **Logging:**
   - Winston logs to CloudWatch / Papertrail
   - Error tracking with Sentry
   - Uptime monitoring (Pingdom, UptimeRobot)

3. **Metrics to Track:**
   - Response time
   - Error rate
   - Active users
   - Chart calculations
   - API endpoint performance

---

## Scaling Strategy

### Horizontal Scaling
- Use load balancer
- Multiple backend instances
- Database read replicas

### Vertical Scaling
- Increase database instance size
- Add more compute resources
- Optimize query performance

---

## Backup Strategy

### Database Backups
- Daily automated backups
- Weekly full backups
- 30-day retention
- Off-site backup storage

### Code & Configuration Backups
- Version control (Git) for code
- Environment variable documentation
- Configuration backup in version control

---

## Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates obtained
- [ ] Domain configured
- [ ] DNS records updated
- [ ] Monitoring configured
- [ ] Log aggregation set up

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] API endpoints functional
- [ ] Frontend loads correctly
- [ ] Authentication flow works
- [ ] Chart calculation test
- [ ] Performance baseline established

---

## Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check DATABASE_URL
- Verify PostgreSQL is running
- Check firewall rules

**Authentication Fails:**
- Verify JWT_SECRET is set
- Check token expiration
- Verify user exists in database

**Chart Calculation Errors:**
- Verify Swiss Ephemeris files are present
- Check birth data input
- Review calculation logs

---

## Rollback Plan

If deployment issues arise:

1. **Immediate Rollback:**
   ```bash
   git revert HEAD~1
   docker-compose up -d
   # OR
   pm2 restart astrology-api
   ```

2. **Database Rollback:**
   ```bash
   npm run db:rollback
   ```

3. **Document the issue** and fix before re-deploying

---

## Maintenance Tasks

### Weekly
- Review security logs
- Check error rates
- Monitor database performance

### Monthly
- Update dependencies
- Review and optimize queries
- Security audit

### Quarterly
- Review and update documentation
- Disaster recovery test
- Performance optimization review
- Security penetration test
