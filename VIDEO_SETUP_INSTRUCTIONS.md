# 📹 Video Background Setup Instructions

## Where to Put Your Videos

### Step 1: Get Your Video Files
You need these two files:
- `hotel.mp4` (for mobile)
- `hotelDESKTOP.mp4` (for desktop)

### Step 2: Place Them in the Public Folder

**Location:** `/Users/salekhmahmood/BestHotelRates/best-hotel-rates-app/public/`

**Commands:**
```bash
cd /Users/salekhmahmood/BestHotelRates/best-hotel-rates-app

# Create public folder if it doesn't exist
mkdir -p public

# Copy your videos here (from wherever they are)
# For example, if they're in Downloads:
cp ~/Downloads/hotel.mp4 public/
cp ~/Downloads/hotelDESKTOP.mp4 public/

# OR if they're in the parent directory:
cp ../hotel.mp4 public/
cp ../hotelDESKTOP.mp4 public/
```

### Step 3: I'll Enable the Video Background

Once you've placed the videos in `public/`, the VideoBackground component will automatically use them!

**Files:** 
- `public/hotel.mp4` (mobile version)
- `public/hotelDESKTOP.mp4` (desktop version)

---

## Current Status

**Background:** Using blue gradient (temporary)  
**Ready to switch:** Yes! Just add videos to `public/` folder  
**Will automatically work:** Yes, component already built  

---

## What Happens After You Add Videos

The `VideoBackground` component will:
- ✅ Auto-detect mobile vs desktop
- ✅ Switch videos on resize
- ✅ Apply blur effect (4px)
- ✅ Stay fixed in background
- ✅ Auto-play and loop
- ✅ Work on all devices

---

## Quick Command

**If your videos are in the parent BestHotelRates folder:**
```bash
cd /Users/salekhmahmood/BestHotelRates/best-hotel-rates-app
cp ../hotel.mp4 ../hotelDESKTOP.mp4 public/
```

**Then I'll uncomment the VideoBackground component in layout.tsx!**

Let me know when you've added them and I'll activate it! 🎥

