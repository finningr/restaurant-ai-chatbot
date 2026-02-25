# Production Deployment Checklist

Quick reference checklist - see `PRODUCTION_DEPLOYMENT.md` for detailed instructions.

---

## 🔴 Critical (Must Do Before Launch)

- [ ] **Environment Variables Set**
  - [ ] `OPENAI_API_KEY` configured with sufficient credits
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` set
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
  - [ ] `NEXTAUTH_SECRET` set (32+ character random string)
  - [ ] `NEXTAUTH_URL` set to production domain
  - [ ] All variables tested in production environment

- [ ] **Database Setup**
  - [ ] Schema migrated (`supabase-schema-final.sql`)
  - [ ] Indexes created (`database-indexes.sql`)
  - [ ] RLS policies configured (`rls-policies.sql`)
  - [ ] Test queries run successfully

- [ ] **Security**
  - [ ] Rate limiting implemented on `/api/chat`
  - [ ] RLS policies tested
  - [ ] No secrets in code or logs
  - [ ] CORS headers configured correctly

- [ ] **Error Monitoring**
  - [ ] Sentry or similar service configured
  - [ ] Error alerts set up
  - [ ] Test error tracking works

---

## 🟡 Important (Should Do Before Launch)

- [ ] **Performance**
  - [ ] Database indexes verified
  - [ ] API response times < 2 seconds
  - [ ] Caching implemented for menu data
  - [ ] Build completes without errors

- [ ] **Testing**
  - [ ] All chatbot features tested
  - [ ] Widget embedding tested
  - [ ] Concurrent users tested (10+ simultaneous)
  - [ ] Error scenarios tested

- [ ] **Monitoring**
  - [ ] Analytics tracking configured
  - [ ] OpenAI API usage monitoring set up
  - [ ] Database performance monitoring enabled
  - [ ] Log aggregation configured

---

## 🟢 Nice to Have (Can Do After Launch)

- [ ] **Backups**
  - [ ] Backup strategy documented
  - [ ] Restore process tested
  - [ ] Backup retention policy set

- [ ] **Documentation**
  - [ ] API documentation updated
  - [ ] Deployment process documented
  - [ ] Team trained on monitoring tools

- [ ] **Scaling**
  - [ ] Scaling plan documented
  - [ ] Load testing completed
  - [ ] Auto-scaling configured (if needed)

---

## 📋 Pre-Launch Verification

Run these commands and verify output:

```bash
# 1. Build succeeds
npm run build

# 2. Production build runs locally
npm start

# 3. Test widget endpoint
curl http://localhost:3000/api/widget/test-widget-id

# 4. Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ Widget endpoint returns restaurant data
- ✅ Chat endpoint returns chatbot response
- ✅ No console errors in browser

---

## 🚀 Deployment Steps

1. **Set Environment Variables** in hosting platform
2. **Run Database Migrations** in Supabase SQL Editor
3. **Create Indexes** (`database-indexes.sql`)
4. **Configure RLS** (`rls-policies.sql`)
5. **Deploy Code** to hosting platform
6. **Verify Deployment** (check all endpoints)
7. **Monitor First 24 Hours** (errors, performance, costs)

---

## 📞 Post-Launch Monitoring

**First 24 Hours:**
- Monitor error rates (< 1% target)
- Check API response times (< 2s target)
- Review OpenAI API costs
- Check database performance
- Monitor user feedback

**Weekly:**
- Review error logs
- Check OpenAI costs
- Review analytics data
- Security updates

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables, Node version |
| API returns 500 | Check error logs, verify API keys |
| Widget doesn't load | Verify CORS headers, check widget_id |
| Slow responses | Check database indexes, enable caching |
| Rate limit errors | Implement rate limiting (see `rate-limiting-example.ts`) |

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated:** [Date]


