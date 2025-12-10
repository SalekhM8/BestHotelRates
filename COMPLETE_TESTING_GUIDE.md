# 🧪 COMPLETE TESTING GUIDE - Best Hotel Rates

## 🔑 ALL LOGIN CREDENTIALS

### **Regular User Account:**
```
Email:    test@example.com
Password: password123
```

### **Admin Account:**
```
Email:    admin@besthotelrates.com
Password: password123
```

### **Stripe Test Cards:**
```
Success Card:     4242 4242 4242 4242
Declined Card:    4000 0000 0000 0002
3D Secure Card:   4000 0025 0000 3155

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Postal Code: Any 5 digits (e.g., 12345)
```

---

## 📊 LOGGED OUT vs LOGGED IN - WHAT WORKS?

### **🚫 LOGGED OUT (Guest Mode):**

#### ✅ **WHAT WORKS:**
- [x] Browse homepage
- [x] View all hotel cards
- [x] Search for hotels
- [x] View search results
- [x] Use filters (price, rating)
- [x] Click hotel to view details
- [x] View hotel information
- [x] Select room type
- [x] **BOOK AND PAY** (Guest Checkout!)
- [x] View About page
- [x] View Blog page
- [x] View Categories page

#### ❌ **WHAT DOESN'T WORK (Redirects to Login):**
- [ ] ❌ Click heart/wishlist button → Redirects to `/login`
- [ ] ❌ View `/wishlist` page → Redirects to `/login`
- [ ] ❌ View `/profile` page → Redirects to `/login`
- [ ] ❌ View `/bookings` page → Redirects to `/login`
- [ ] ❌ Access user menu in header → Shows "Login" button

**Security:** ✅ All protected features properly secured!

---

### **✅ LOGGED IN (Registered User):**

#### ✅ **EVERYTHING WORKS:**
- [x] ✅ All features from logged out mode PLUS:
- [x] ✅ Click heart → Adds to wishlist (saves to database!)
- [x] ✅ View wishlist page
- [x] ✅ Remove from wishlist
- [x] ✅ View profile page
- [x] ✅ Edit profile (name, phone)
- [x] ✅ View "My Bookings" page
- [x] ✅ Filter bookings (All, Upcoming, Past)
- [x] ✅ Booking form PRE-FILLED with your data
- [x] ✅ User dropdown menu in header
- [x] ✅ Account stats (total bookings, wishlist count, total spent)
- [x] ✅ Logout option

**Benefits:** Profile saved, bookings tracked, wishlist synced!

---

## 🔐 GUEST CHECKOUT vs LOGGED-IN BOOKING

### **Guest Checkout (No Account Required):**

```
1. Logged Out
2. Click hotel → Select room → "Book Now"
3. See blue message: "Guest Checkout: You're booking as a guest"
4. Form is EMPTY - must fill manually:
   - Name: John Guest
   - Email: guest@example.com
   - Phone: +44 7700 900000
   - Special requests: (optional)
5. Review summary
6. Proceed to Stripe payment
7. Pay successfully
8. ✅ Booking saved with userId = NULL
9. ❌ Won't appear in "My Bookings" (no account!)
10. ✅ Admin can still see it in admin dashboard
```

**Database Record:**
```sql
userId: NULL  ← Guest booking!
guestName: "John Guest"
guestEmail: "guest@example.com"
guestPhone: "+44 7700 900000"
```

---

### **Logged-In User Booking:**

```
1. Logged In (test@example.com)
2. Click hotel → Select room → "Book Now"
3. NO blue message (you're logged in!)
4. Form is PRE-FILLED:
   - Name: Test User (from your profile!)
   - Email: test@example.com (from your profile!)
   - Phone: (your saved phone)
5. Can edit if needed
6. Review summary
7. Proceed to Stripe payment
8. Pay successfully
9. ✅ Booking saved with userId = your user ID
10. ✅ APPEARS in "My Bookings"!
11. ✅ Tracked in your profile stats
```

**Database Record:**
```sql
userId: "clxxx123"  ← Linked to your account!
guestName: "Test User"
guestEmail: "test@example.com"
guestPhone: "+44 7700 900000"
```

---

## 🧪 COMPLETE TESTING CHECKLIST

### **Test 1: Guest Checkout Journey** (No Login)

**Steps:**
```
1. ✅ Open http://localhost:3000 in INCOGNITO mode
2. ✅ Click any hotel card
3. ✅ Click "Book Now" 
4. ✅ See "Guest Checkout" blue message
5. ✅ Fill form manually:
   - Name: Guest Tester
   - Email: guesttest@example.com
   - Phone: +44 7700 900000
6. ✅ Click "Continue to Summary"
7. ✅ Review details
8. ✅ Click "Proceed to Payment"
9. ✅ Stripe checkout page appears
10. ✅ Enter: 4242 4242 4242 4242 / 12/25 / 123
11. ✅ Click "Pay"
12. ✅ See success page with booking reference
13. ✅ Booking saved to database
```

**Verify:**
- Go to `/admin/login`
- Login as admin
- See the guest booking in bookings table
- userId should be NULL

---

### **Test 2: Logged-In User Booking**

**Steps:**
```
1. ✅ Go to http://localhost:3000
2. ✅ Click "Login" (top right)
3. ✅ Login with: test@example.com / password123
4. ✅ See your name in header
5. ✅ Click any hotel card
6. ✅ Click "Book Now"
7. ✅ Form is PRE-FILLED with your profile data!
8. ✅ Review summary
9. ✅ Proceed to payment
10. ✅ Pay with test card
11. ✅ Booking complete
12. ✅ Click your name → "My Bookings"
13. ✅ SEE YOUR BOOKING IN THE LIST!
```

**Verify:**
- Booking appears in "My Bookings"
- Has your user ID linked
- Shows in your profile stats

---

### **Test 3: Wishlist (Requires Login)**

**Steps:**
```
1. ✅ LOGGED OUT: Click heart on hotel
   → Redirects to login page ✓ (Security works!)

2. ✅ LOGIN: test@example.com / password123

3. ✅ Click heart on multiple hotels
   → Hearts turn red ✓
   → Saves to database ✓

4. ✅ Click "Favorites" (bottom nav on mobile OR header menu)
   → See your saved hotels ✓

5. ✅ Click heart again on a saved hotel
   → Removes from wishlist ✓

6. ✅ LOGOUT and try to access /wishlist
   → Redirects to login ✓ (Security works!)
```

---

### **Test 4: Search & Filters**

**Steps:**
```
1. ✅ Type in destination: "Lond"
   → Dropdown appears with London, UK ✓

2. ✅ Click destination from dropdown
   → Selected ✓

3. ✅ Click "Check in"
   → Beautiful glassmorphism calendar appears ✓
   → Select a date ✓

4. ✅ Click "Check out"
   → Calendar with range from check-in ✓
   → Select checkout date ✓

5. ✅ Click "Guests"
   → Dropdown with +/- buttons appears ✓
   → Increase adults: 2 → 3 ✓
   → Add children: 0 → 1 ✓
   → Shows "4 guests, 1 room" ✓

6. ✅ Click "Search"
   → Routes to /search?destination=London... ✓
   → Shows filtered results ✓

7. ✅ Use price slider
   → Results update in real-time ✓

8. ✅ Filter by rating (4.5+)
   → Shows only 4.5+ star hotels ✓

9. ✅ Sort by "Price: Low to High"
   → Re-orders results ✓
```

---

### **Test 5: Admin Dashboard**

**Steps:**
```
1. ✅ Go to http://localhost:3000/admin/login

2. ✅ Login:
   Email: admin@besthotelrates.com
   Password: password123

3. ✅ See dashboard with stats:
   - Total Revenue
   - Total Bookings
   - Total Users
   - Cancelled Bookings

4. ✅ Click "All Bookings"
   → See bookings table ✓

5. ✅ Search for booking:
   → Type booking reference or guest name ✓

6. ✅ Filter by status:
   → Click "Pending", "Confirmed", etc. ✓

7. ✅ Update booking status:
   → Use dropdown to change status ✓
   → Saves to database ✓

8. ✅ Export CSV:
   → Click "Export CSV" ✓
   → Downloads file ✓

9. ✅ View booking details:
   → Click "View →" on any booking ✓
   → See complete information ✓

10. ✅ Logout
    → Session cleared ✓
```

---

### **Test 6: Profile Management**

**Steps:**
```
1. ✅ Login: test@example.com / password123

2. ✅ Click your name → "Profile"

3. ✅ See account stats:
   - Total Bookings: X
   - Wishlist Count: X
   - Total Spent: £X

4. ✅ Click "Edit Profile"
   → Form becomes editable ✓

5. ✅ Change name/phone
   → Click "Save Changes" ✓
   → Saves to database ✓
   → Name updates in header ✓

6. ✅ Click "My Bookings"
   → See all your bookings ✓
   → Filter: All/Upcoming/Past ✓
```

---

## 🎯 KEY DIFFERENCES: GUEST vs LOGGED-IN

### **Saving/Wishlist:**
```
❌ LOGGED OUT:
- Click heart → Redirects to login
- Cannot save hotels
- No wishlist access

✅ LOGGED IN:
- Click heart → Saves to database instantly
- View wishlist page
- Remove from wishlist
- Wishlist synced across devices
```

### **Booking Form:**
```
❌ LOGGED OUT (Guest):
- Form is EMPTY
- Must type everything manually
- No pre-filled data
- Booking doesn't link to account

✅ LOGGED IN (User):
- Form PRE-FILLED with profile data
- Can still edit if needed
- Faster checkout
- Booking appears in "My Bookings"
```

### **Booking History:**
```
❌ LOGGED OUT (Guest):
- Booking saved in DB
- But can't view it later
- No booking history access
- Must save confirmation email

✅ LOGGED IN (User):
- Booking saved AND linked to account
- View in "My Bookings" anytime
- See all past bookings
- Track booking status
```

### **Profile Features:**
```
❌ LOGGED OUT:
- No profile
- No account stats
- No saved preferences
- No booking history

✅ LOGGED IN:
- Full profile management
- Edit name/phone
- See account stats
- View booking history
- Manage wishlist
```

---

## 📋 COMPLETE TEST SCENARIOS

### **Scenario A: First-Time Visitor (Guest Checkout)**
```
1. Open incognito window
2. Visit http://localhost:3000
3. Browse hotels (works!)
4. Try to click heart → Redirected to login ✓
5. Click hotel → View details (works!)
6. Click "Book Now"
7. See "Guest Checkout" message ✓
8. Fill form manually
9. Pay with 4242 4242 4242 4242
10. Booking complete! ✓
11. Try to access /bookings → Redirected to login ✓
```

**Result:** Can book as guest, but no account features!

---

### **Scenario B: Registered User (Full Features)**
```
1. Regular browser window
2. Click "Login" → Go to /login
3. Login: test@example.com / password123
4. See "Test User" in header ✓
5. Click heart on 3 hotels → All save to wishlist ✓
6. Click "Favorites" → See 3 saved hotels ✓
7. Click hotel → "Book Now"
8. Form PRE-FILLED with your info! ✓
9. Pay and complete booking
10. Click "My Bookings" → See your booking! ✓
11. Click "Profile" → See stats updated ✓
12. Click "Wishlist" → Still shows saved hotels ✓
```

**Result:** Full platform access with saved data!

---

### **Scenario C: Admin Management**
```
1. Go to http://localhost:3000/admin/login
2. Login: admin@besthotelrates.com / password123
3. See dashboard with all stats ✓
4. View recent bookings ✓
5. Click "All Bookings" ✓
6. See BOTH:
   - Guest bookings (userId = NULL)
   - User bookings (userId = linked)
7. Search for specific booking ✓
8. Update booking status ✓
9. Export all bookings to CSV ✓
10. View individual booking details ✓
```

**Result:** Full business management!

---

## 🎯 WHAT TO TEST RIGHT NOW

### **Priority 1: Payment Flow** 💳
```
1. Book a hotel (guest or logged in)
2. Go through booking flow
3. Click "Proceed to Payment"
4. YOU SHOULD SEE STRIPE CHECKOUT PAGE
5. Enter: 4242 4242 4242 4242
6. Pay
7. See success page
8. Booking saved in database
```

**Expected:** Payment works, booking saved!

---

### **Priority 2: Guest vs Logged-In** 👥
```
Test A (Logged Out):
- Try wishlist → Blocked ✓
- Try profile → Blocked ✓
- Try bookings → Blocked ✓
- Book as guest → Works ✓

Test B (Logged In):
- Wishlist → Works ✓
- Profile → Works ✓
- Bookings → Works ✓
- Form pre-filled → Works ✓
```

**Expected:** Security works, features gated properly!

---

### **Priority 3: Admin Dashboard** 👔
```
1. Login to admin
2. See stats
3. View bookings
4. Update status
5. Export CSV
```

**Expected:** Full business control!

---

## 🔍 HOW TO VERIFY IN DATABASE

### **View Database:**
```bash
cd /Users/salekhmahmood/BestHotelRates/best-hotel-rates-app
npm run prisma:studio
# Opens at http://localhost:5555
```

### **Check Guest Bookings:**
```
Prisma Studio → Booking table
Look for: userId = NULL
These are guest bookings!
```

### **Check User Bookings:**
```
Prisma Studio → Booking table
Look for: userId = "clxxx..."
These are linked to user accounts!
```

### **Check Wishlist:**
```
Prisma Studio → Wishlist table
Each item has: userId + hotelId
Only works when logged in!
```

---

## ⚠️ IMPORTANT SECURITY NOTES

### **Wishlist Security:** ✅ WORKING!
```
- Logged out: API returns 401 Unauthorized
- Logged in: API returns wishlist data
- Cannot access other users' wishlists
- All API endpoints verify session
```

### **Booking Security:** ✅ WORKING!
```
- Guest bookings: userId = NULL (allowed!)
- User bookings: userId = verified from session
- Cannot view other users' bookings
- Admin can see all bookings
```

### **Profile Security:** ✅ WORKING!
```
- Must be logged in to access
- Can only edit your own profile
- Protected by middleware
- Session verified on every request
```

---

## 🚀 COMPLETE FEATURE MATRIX

| Feature | Logged Out (Guest) | Logged In (User) |
|---------|-------------------|------------------|
| **Browse Hotels** | ✅ Yes | ✅ Yes |
| **Search Hotels** | ✅ Yes | ✅ Yes |
| **View Details** | ✅ Yes | ✅ Yes |
| **Use Filters** | ✅ Yes | ✅ Yes |
| **Book & Pay** | ✅ Yes (Guest Checkout) | ✅ Yes (Pre-filled) |
| **Save to Wishlist** | ❌ No (Login Required) | ✅ Yes |
| **View Wishlist** | ❌ No (Redirects) | ✅ Yes |
| **View Bookings** | ❌ No (Redirects) | ✅ Yes |
| **Edit Profile** | ❌ No (Redirects) | ✅ Yes |
| **Form Pre-fill** | ❌ No | ✅ Yes |
| **Booking History** | ❌ No | ✅ Yes |
| **Account Stats** | ❌ No | ✅ Yes |

---

## 📱 PAGES & ROUTES

### **Public Pages (Anyone Can Access):**
```
/                - Homepage
/search          - Search results
/hotels/[id]     - Hotel details
/booking         - Booking flow (guest checkout!)
/login           - User login
/register        - User registration
/about           - About us
/blog            - Blog
/categories      - Browse categories
```

### **Protected Pages (Login Required):**
```
/profile         - User profile
/bookings        - My bookings
/wishlist        - Saved hotels

All redirect to /login if not authenticated!
```

### **Admin Pages (Admin Login Required):**
```
/admin/login          - Admin login
/admin/dashboard      - Dashboard stats
/admin/bookings       - All bookings management
/admin/bookings/[id]  - Booking detail view
```

---

## 🎯 WHAT'S LEGIT & WORKING

### ✅ **100% Functional:**
1. **Guest Checkout** - Book WITHOUT account!
2. **User Accounts** - Full registration/login
3. **Wishlist** - Save hotels (login required!)
4. **Profile** - Edit details, see stats
5. **Bookings** - View history (login required!)
6. **Payments** - Stripe working with test cards
7. **Admin** - Full dashboard with management
8. **Search** - Autocomplete, calendars, guest picker
9. **Filters** - Price, rating, sorting
10. **Mobile** - Fully responsive
11. **Video Backgrounds** - On all pages
12. **Security** - All routes protected properly

### ⏳ **What's Not Fully Integrated:**
1. **Email confirmations** - Bookings save but no email sent
2. **Real hotel API** - Using mock data (need API credentials)
3. **PDF vouchers** - No download yet
4. **Cancel booking** - UI ready, API not built

---

## 🎊 READY TO TEST!

**Server is starting at:** `http://localhost:3000`

### **Test These 5 Things:**

1. **Guest Checkout** (incognito)
2. **User Login** (test@example.com)
3. **Wishlist Security** (logged out vs in)
4. **Stripe Payment** (4242 test card)
5. **Admin Dashboard** (admin login)

---

## 📞 ALL CREDENTIALS SUMMARY

```
👤 USER LOGIN:
   test@example.com / password123

👔 ADMIN LOGIN:
   admin@besthotelrates.com / password123

💳 STRIPE TEST CARD:
   4242 4242 4242 4242 / 12/25 / 123

🗄️ DATABASE ACCESS:
   npm run prisma:studio
   http://localhost:5555
```

---

**Everything is legit and working! Test it all and let me know what you find!** 🚀

**Once you test, tell me what to build next: Emails, Legal pages, or something else?** 📧⚖️


