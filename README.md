# Seat Booking System - Segment Tree Implementation

A modern, interactive bus/railway seat booking system powered by **Segment Tree with Lazy Propagation** data structure. This project demonstrates efficient seat management across journey segments with real-time visualization.

## 🎯 Features

- **Efficient Seat Management**: O(log M) time complexity per operation using Segment Trees
- **Real-time Visualization**: Interactive UI showing segment tree structure and bookings
- **Range-based Booking**: Book seats for specific journey segments (from station to station)
- **Availability Queries**: Quickly find available seats for any route
- **Visual Journey Tracking**: See your journey path visually
- **Booking History**: Track all bookings with detailed information

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional dependencies or installations required!

### Running the Application

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start booking seats!

## 📚 How It Works

### Segment Tree Concept

The system uses a **Segment Tree** to manage seat availability efficiently. Each seat has its own segment tree tracking which journey segments are occupied.

**Example**: With 10 stations, we have 9 segments: `[0,1), [1,2), [2,3), ..., [8,9)`

```
Station:     0 -------- 1 -------- 2 -------- 3 -------- 4
Segments:        [0,1)      [1,2)      [2,3)      [3,4)
```

### Tree Structure

The segment tree is a binary tree where:
- **Leaf nodes** represent individual segments
- **Internal nodes** represent ranges of segments
- **Each node** stores the maximum occupancy in its range

```
                [0,4) Max=1          ← Root covers all segments
               /            \
          [0,2) Max=1      [2,4) Max=0
         /         \       /         \
    [0,1) M=0  [1,2) M=1  [2,3) M=0  [3,4) M=0  ← Leaves
```

### Operations

#### Booking a Seat
1. **Query**: Check if max occupancy in range `[L, R)` is 0
2. **Update**: If available, add +1 to all segments in range `[L, R)`
3. **Propagate**: Tree nodes update lazily to reflect new maximum

#### Cancelling a Booking
1. **Find**: Locate the booking record
2. **Update**: Subtract -1 from the booked range `[L, R)`
3. **Restore**: Seat becomes available for new bookings

#### Finding Available Seats
- Query each seat's segment tree for the desired route
- If `max == 0` in the range: seat is available
- If `max > 0`: seat has conflicting bookings

### Lazy Propagation

Instead of updating all nodes immediately:
- Mark parent nodes with a "lazy" value
- Push lazy values down only when needed
- Makes range updates **O(log M)** instead of O(M)

## 🎮 Usage Guide

### Booking a Seat

1. **Select Journey**: Choose "From Station" and "To Station"
2. **Pick a Seat**: Click on an available seat (gray)
3. **Book**: Click the "Book Seat" button
4. **Confirm**: See your booking appear in the log

### Cancelling a Booking

1. **Find your booking** in the Booking Log
2. Click the **"Cancel"** button next to it
3. The seat becomes available again for that route

### Finding Available Seats

1. Select your desired route
2. Click **"Find Available"** button
3. All available seats will be highlighted

## 🔧 Technical Details

### Time Complexity

- **Book Seat**: O(log M) per seat
- **Cancel Booking**: O(log M) per seat
- **Query Availability**: O(log M) per seat
- **Find All Available**: O(N × log M) where N = number of seats

### Space Complexity

- **Per Seat**: O(4M) for segment tree
- **Overall**: O(N × M) where N = seats, M = stations

### File Structure

```
.
├── index.html          # Main HTML structure
├── index.css           # Styling and animations
├── index.js            # Segment tree implementation and logic
└── README.md           # This file
```

## 🎨 UI Components

- **Control Panel**: Station selection, seat grid, and action buttons
- **Algorithm Card**: Real-time segment tree visualization
- **Booking Log**: List of all active bookings
- **Journey Visual**: Interactive journey path display
- **Status Messages**: Toast notifications for user feedback

## 📊 Default Configuration

- **Number of Seats**: 20 seats (configurable)
- **Number of Stations**: 10 stations (configurable)
- **Journey Segments**: 9 segments

## 🧪 Example Scenarios

### Scenario 1: Non-overlapping Journeys
- Passenger A books Seat 1 from Station 0 → 3
- Passenger B books Seat 1 from Station 5 → 8
- ✅ Both bookings succeed (no overlap)

### Scenario 2: Overlapping Journeys
- Passenger A books Seat 2 from Station 2 → 6
- Passenger B tries Seat 2 from Station 4 → 8
- ❌ Booking fails (segments [4,6) overlap)

### Scenario 3: Adjacent Journeys
- Passenger A books Seat 3 from Station 0 → 4
- Passenger B books Seat 3 from Station 4 → 8
- ✅ Both succeed (boundaries don't overlap)

## 🎓 Learning Outcomes

This project demonstrates:
- **Segment Tree** data structure implementation
- **Lazy Propagation** optimization technique
- **Range queries** and updates
- **Real-world application** of advanced data structures
- **Interactive visualization** of algorithms

## 🤝 Contributing

This is a DSA lab project. Suggestions and improvements are welcome!

## 📝 License

This project is created for educational purposes as part of DSA Lab coursework.

## 👨‍💻 Author

Created for DSA Lab - College Coursework

---

**Note**: This implementation prioritizes clarity and educational value. For production systems, additional features like persistent storage, user authentication, and server-side validation would be required.
