----------------------------------------------------
##-- Query orders by userId (GSI already exists!)
##-- Add pagination support
##-- Add filtering (by status, date range)
----------------------------------------------------
##-- Adding Bash Script for all this APi for Garanting it works
----------------------------------------------------
Add Missing CRUD Features
-Update Order Items 
===> PUT /orders/{orderId}/items (DONE)
** Add items to existing order (DONE)
** Remove items from order (DONE)
** Update item quantities (DONE)
-Cancel Order (DONE)
===> POST /orders/{orderId}/cancel (DONE)
**Cancel order (change status to CANCELLED) (DONE)
**Publish OrderCancelled event (DONE)
**Prevent cancellation if already shipped (DONE)

-Order History/Tracking (DONE)
===> GET /orders/{orderId}/history (DONE)
** Show status change history (DONE)
** Show who made changes (DONE)
** Show timestamps (DONE)

Search & Filter Orders  (DONE)
===> GET /orders?status=PENDING (DONE)
GET /orders?fromDate=2024-01-01&toDate=2024-12-31 (DONE)
GET /orders?minAmount=100&maxAmount=500 (DONE)
GET /orders?sortBy=createdAt&sortOrder=desc (DONE)


Business Logic Enhancements
=>Validate order total matches items (DONE)
=>Validate minimum order amount (DONE)
=>Validate maximum items per order (DONE)
=> Validate shipping address format (DONE)


==Order Status Workflow 
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
        ↘ CANCELLED (DONE)
Rules:
--> Can't ship if not confirmed (DONE)
--> Can't deliver if not shipped (DONE)
--> Can only cancel if PENDING or CONFIRMED (DONE)

==> Idempotency
- Prevent duplicate orders (DONE)
- Use idempotency key in headers (DONE)
- Store processed requests in DynamoDB (DONE)

Error Handling & Resilience (DONE)
==> Retry Logic 
**Exponential backoff for DynamoDB
**Retry failed EventBridge publishes
**Handle transient failures
==> Dead Letter Queue Processing
** Lambda to process DLQ messages
** Log failures to CloudWatch
** Alert on DLQ messages
** Retry mechanism

Better Error Responses
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with ID abc123 not found",
    "details": {...}
  }
}

Performance & Optimization 
==> Cache frequently accessed orders
==> Use API Gateway caching for GET requests
==> Add Cache-Control headers

Optimize DynamoDB Queries 
===> Use batch operations
===> Optimize GSI queries
===> Add pagination for large results

Lambda Optimization 
===> Reduce cold starts
===> Optimize bundle size
===> Connection pooling
===> Environment variable caching


Phase 6: Observability 
---> Structured Logging (
logger.info('Order created', {
  orderId: order.orderId,
  userId: order.userId,
  totalAmount: order.totalAmount,
  itemCount: order.items.length
});
```

### **6.2 CloudWatch Dashboards** (1 hour)
- ✅ Orders created per day
- ✅ Average order value
- ✅ Order status distribution
- ✅ API latency (P50, P99)
- ✅ Error rates

### **6.3 CloudWatch Alarms** (30 min)
- ✅ High error rate (>5%)
- ✅ DLQ messages
- ✅ Lambda timeouts
- ✅ DynamoDB throttling

### **6.4 X-Ray Tracing** (30 min)
- ✅ Enable X-Ray on all Lambdas
- ✅ Trace end-to-end requests
- ✅ Identify bottlenecks

---

## 📋 **Phase 7: Testing** ⏱️ 3-4 hours

### **7.1 More Unit Tests** (1.5 hours)
- ✅ Test all edge cases
- ✅ Test error scenarios
- ✅ Test validation logic

### **7.2 Integration Tests** (1.5 hours)
- ✅ Test with real DynamoDB Local
- ✅ Test event publishing
- ✅ Test auth integration

### **7.3 Load Testing** (1 hour)
- ✅ Use Artillery or k6
- ✅ Test 100, 1000, 10000 concurrent users
- ✅ Find breaking points

---

## 📋 **Phase 8: Documentation** ⏱️ 2 hours

### **8.1 API Documentation** (1 hour)
- ✅ OpenAPI/Swagger spec
- ✅ Request/response examples
- ✅ Error codes documentation

### **8.2 Architecture Documentation** (1 hour)
- ✅ Update architecture diagram
- ✅ Document data flow
- ✅ Document event schemas

---

## 🎯 **My Recommended Priority Order:**

### **🔥 CRITICAL (Do First)**
```
1. Complete Auth Integration (Phase 1)     ← Users can only see their orders
2. Order Status Workflow (Phase 3.2)       ← Business logic is correct
3. Error Handling (Phase 4)                ← System is resilient
4. CloudWatch Dashboards (Phase 6.2)       ← You can monitor it
```
**Time: 1-2 days**

---

### **🚀 HIGH PRIORITY (Do Next)**
```
5. Search & Filter (Phase 2.4)             ← Better UX
6. Cancel Order (Phase 2.2)                ← Common feature
7. Structured Logging (Phase 6.1)          ← Debugging easier
8. More Unit Tests (Phase 7.1)             ← Confidence in code
```
**Time: 2-3 days**

---

### **💪 MEDIUM PRIORITY (Nice to Have)**
```
9. Idempotency (Phase 3.3)                 ← Prevent duplicates
10. Order History (Phase 2.3)               ← Audit trail
11. Performance Optimization (Phase 5)      ← Scale better
12. API Documentation (Phase 8.1)           ← Professional look
```
**Time: 3-4 days**

---

### **🌟 LOW PRIORITY (Polish)**
```
13. Update Order Items (Phase 2.1)          ← Edge case
14. Load Testing (Phase 7.3)                ← Know limits
15. X-Ray Tracing (Phase 6.4)               ← Advanced debugging


