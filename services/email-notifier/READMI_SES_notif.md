# 📧 AWS SES (Simple Email Service) Configuration

## 🎯 Overview

AWS SES is used to send transactional emails (order confirmations, status updates, etc.) to customers.

---

## 🔐 SES Operating Modes

### **Sandbox Mode (Default)**

When you first start using SES, your account is in **Sandbox mode**.

**Limitations:**
- ✅ Can send emails FROM verified addresses only
- ✅ Can send emails TO verified addresses only
- ✅ Maximum 200 emails per 24 hours
- ✅ Maximum 1 email per second
- ❌ Cannot send to unverified recipients
- ❌ Not suitable for production

**Use Case:** Development and testing

---

### **Production Mode**

After requesting and receiving approval, you get full SES access.

**Benefits:**
- ✅ Can send FROM verified addresses
- ✅ Can send TO any email address (no verification needed)
- ✅ Higher sending limits (50,000+ emails per day)
- ✅ Better deliverability
- ✅ Production-ready

**Use Case:** Production applications

---

## 📋 Email Verification Commands

### **Verify Sender Email (Required in Both Modes)**
```bash


## 📋 Email Verification Commands

### **Verify Sender Email (Required in Both Modes)**
```bash
# Verify your business/sender email
aws ses verify-email-identity --email-address your-business@example.com

# Example
aws ses verify-email-identity --email-address bousilmustapha@gmail.com
```

**What happens:**
1. AWS sends verification email to the address
2. Check your inbox
3. Click the verification link
4. Wait 1-2 minutes

---

### **Verify Receiver Email (Only Required in Sandbox)**
```bash
# In Sandbox mode, verify test recipient emails
aws ses verify-email-identity --email-address customer-test@example.com

# Example
aws ses verify-email-identity --email-address mugiwaraf0789@gmail.com
```

**Note:** In Production mode, you don't need to verify receiver emails!

---


### **Check Verification Status**
```bash
# Check single email
aws ses get-identity-verification-attributes \
  --identities your-email@example.com

# Check multiple emails
aws ses get-identity-verification-attributes \
  --identities email1@example.com email2@example.com email3@example.com

# Example
aws ses get-identity-verification-attributes \
  --identities bousilmustapha@gmail.com mugiwaraf0789@gmail.com
```

**Expected Output (Success):**
```json
{
  "VerificationAttributes": {
    "your-email@example.com": {
      "VerificationStatus": "Success"
    }
  }
}


**Possible Statuses:**
- `Success` - ✅ Verified and ready to use
- `Pending` - ⏳ Verification email sent, waiting for confirmation
- `Failed` - ❌ Verification failed
- `TemporaryFailure` - ⚠️ Try again later
- `NotStarted` - ❌ Never verified

---

### **List All Verified Identities**
```bash
# List all verified email addresses
aws ses list-identities

# List with detailed verification status
aws ses list-identities --query 'Identities[*]' --output table
```

---

### **Delete Email Identity (Unverify)**
```bash
# Remove email verification (if needed)
aws ses delete-identity --identity your-email@example.com
```

---

## 🚀 Moving from Sandbox to Production

### **Step 1: Request Production Access**
```bash
# Open AWS Console
# Navigate to: SES → Account dashboard → Request production access

# Or use this direct link:
# https://console.aws.amazon.com/ses/home#/account
```

**Required Information:**
1. **Use case description:**
```
   Transactional emails for e-commerce platform:
   - Order confirmations
   - Order status updates
   - Password resets
   - Account notifications
```

2. **Website URL:** `https://your-website.com`

3. **Email examples:**
   - Describe what emails you'll send
   - Provide sample email content

4. **Compliance:**
   - How you handle unsubscribes
   - How you obtained email addresses
   - Bounce and complaint handling

---

### **Step 2: Wait for Approval**

- **Timeline:** Usually 24-48 hours
- **Response:** AWS sends email with decision
- **If rejected:** Address concerns and reapply

---

### **Step 3: Verify Production Status**
```bash
# Check if you're in production mode
aws ses get-account-sending-enabled

# Check sending limits
aws sesv2 get-account
```

**Expected Output (Production):**
```json
{
  "SendQuota": {
    "Max24HourSend": 50000.0,
    "MaxSendRate": 14.0,
    "SentLast24Hours": 0.0
  },
  "SendingEnabled": true
}
```

---

## 📊 Monitoring SES

### **Check Sending Statistics**
```bash
# Get sending statistics
aws ses get-send-statistics

# Get quota
aws ses get-send-quota
```

---

### **Monitor Bounces and Complaints**
```bash
# View bounce rate
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Reputation.BounceRate \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average

# View complaint rate
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Reputation.ComplaintRate \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average
```

---

## 🎯 Development vs Production Setup

### **Development (Sandbox)**
```yaml
# services/email-notifier/template.yaml
Parameters:
  FromEmail:
    Type: String
    Default: your-dev-email@gmail.com  # Verified sender
```

**Test recipient must be verified:**
```typescript
// In code - use verified test email
const testEmail = 'test-recipient@gmail.com';  // Must be verified
```

**Verification needed:**
```bash
aws ses verify-email-identity --email-address your-dev-email@gmail.com
aws ses verify-email-identity --email-address test-recipient@gmail.com
```

---

### **Production**
```yaml
# services/email-notifier/template.yaml
Parameters:
  FromEmail:
    Type: String
    Default: noreply@yourdomain.com  # Verified sender
```

**Test recipient doesn't need verification:**
```typescript
// In code - can use any customer email
const customerEmail = order.customerEmail;  // No verification needed!
```

**Verification needed:**
```bash
# Only verify sender domain
aws ses verify-domain-identity --domain yourdomain.com
```

---

## 📧 Email Best Practices

### **1. Use Domain Email (Production)**

❌ **Bad:**
```
From: yourname@gmail.com
```

✅ **Good:**
```
From: noreply@yourdomain.com
From: orders@yourdomain.com
From: support@yourdomain.com
```

---

### **2. Verify Domain Instead of Email**
```bash
# Verify entire domain (better for production)
aws ses verify-domain-identity --domain yourdomain.com

# Get DNS records to add
aws ses get-identity-verification-attributes --identities yourdomain.com
```

**Add TXT record to your DNS:**
```
Name: _amazonses.yourdomain.com
Type: TXT
Value: [provided-by-aws]
```

---

### **3. Setup SPF, DKIM, DMARC**

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

**DKIM (automatically provided by SES):**
```bash
# Get DKIM tokens
aws ses get-identity-dkim-attributes --identities yourdomain.com
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

---

### **4. Handle Bounces and Complaints**

Setup SNS topics for notifications:
```bash
# Create SNS topic for bounces
aws sns create-topic --name ses-bounces

# Configure SES to publish to SNS
aws ses set-identity-notification-topic \
  --identity yourdomain.com \
  --notification-type Bounce \
  --sns-topic arn:aws:sns:us-east-1:123456789012:ses-bounces
```

---

## 🔍 Troubleshooting

### **Email Not Sending**
```bash
# Check if identity is verified
aws ses get-identity-verification-attributes --identities your-email@example.com

# Check if sending is enabled
aws ses get-account-sending-enabled

# Check CloudWatch Logs
aws logs tail /aws/lambda/dev-email-notifier --since 10m
```

---

### **"Email address is not verified" Error**

**In Sandbox mode:**
```bash
# Verify both sender AND receiver
aws ses verify-email-identity --email-address sender@example.com
aws ses verify-email-identity --email-address receiver@example.com
```

**Or request production access to send to unverified recipients**

---

### **Rate Limit Exceeded**
```bash
# Check current quota
aws ses get-send-quota

# Request limit increase
# AWS Console → SES → Account dashboard → Request increase
```

---

## 📈 Cost Estimation

**Pricing (as of 2024):**
- First 62,000 emails/month: **FREE** (when sending from EC2)
- After that: **$0.10 per 1,000 emails**
- Data transfer: Standard AWS rates

**Example monthly costs:**
```
10,000 emails/month  = FREE
100,000 emails/month = $3.80
1,000,000 emails/month = $93.80
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Verify email | `aws ses verify-email-identity --email-address email@example.com` |
| Check status | `aws ses get-identity-verification-attributes --identities email@example.com` |
| List verified | `aws ses list-identities` |
| Check quota | `aws ses get-send-quota` |
| Check statistics | `aws ses get-send-statistics` |
| Delete identity | `aws ses delete-identity --identity email@example.com` |

---

## 📚 Additional Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [SES Sandbox Mode](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Email Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [Deliverability Dashboard](https://docs.aws.amazon.com/ses/latest/dg/reputation-dashboard.html)

---

## ✅ Checklist

### **Development Setup:**
- [ ] Verify sender email
- [ ] Verify test recipient emails
- [ ] Configure FROM_EMAIL in template.yaml
- [ ] Test email sending
- [ ] Check CloudWatch logs

### **Production Setup:**
- [ ] Request production access
- [ ] Verify domain (not just email)
- [ ] Setup SPF record
- [ ] Setup DKIM records
- [ ] Setup DMARC record
- [ ] Configure bounce/complaint handling
- [ ] Setup CloudWatch alarms
- [ ] Test with real customer emails
- [ ] Monitor deliverability metrics