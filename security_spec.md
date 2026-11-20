# EcoClean Firebase Security Specification

## 1. Data Invariants
1. **PII Isolation**: `customer_interests` contains customer phone numbers and emails. Public users may only create leads (`create`). Read (`get`/`list`), update, and delete are strictly restricted to verified Admin (`haripriya.0251mba497@dgu.ac.in` or admins collection).
2. **Customer Feedback**: `product_feedback` allows public submissions (`create`), while document management/read is restricted to prevent unauthorized customer data harvesting.
3. **Internal Operations (Trials & Purchases)**: `trials` and `purchases` are sensitive business operations. Read and write operations are strictly restricted to authorized admin users.
4. **Metrics Pulse**: `metrics/summary` stores non-PII aggregated counts. Public may read the aggregate metrics, while only atomic increments/admin updates are permitted.
5. **No Spoofing or Ghost Fields**: All creates must conform strictly to schema bounds (string size limits, numeric rating bounds 1-5).

## 2. The Dirty Dozen Payloads (Designed to Fail / PERMISSION_DENIED)
1. **Unauthenticated Read on customer_interests**: An unauthenticated or non-admin user attempts `getDoc(doc(db, 'customer_interests', 'some-lead'))`.
2. **Unauthenticated List on customer_interests**: An unauthenticated user attempts `getDocs(collection(db, 'customer_interests'))`.
3. **Malicious Ghost Field in Lead**: Customer sends `{ name: "Bob", email: "bob@test.com", phone: "123", location: "Delhi", isAdmin: true, role: "admin" }` to escalate privileges.
4. **Huge String Injection (Denial of Wallet)**: A lead submission with a 500KB payload in `name`.
5. **Unauthenticated Update on customer_interests**: A user attempts to overwrite an existing customer's contact details.
6. **Unauthenticated Delete on customer_interests**: A user attempts to purge customer leads.
7. **Unauthenticated Read on purchases**: An unauthenticated user attempts to scrape financial sales figures in `purchases`.
8. **Unauthenticated Write to purchases**: A malicious client attempts to record a counterfeit purchase.
9. **Unauthenticated Write to trials**: A random user attempts to inject trial records into `trials`.
10. **Invalid Rating Value in product_feedback**: Rating value of `999` or negative numbers like `-5`.
11. **Email Spoofing for Admin Access**: A client token with email set to `haripriya.0251mba497@dgu.ac.in` but `email_verified: false`.
12. **Arbitrary Collection Write**: Attempting to create documents in arbitrary collections like `/system_config/keys` or `/{document=**}`.
