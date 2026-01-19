/**
 * ===================================================================
 * Bus/Railway Seat Booking System using Segment Tree
 * ===================================================================
 * 
 * This implementation uses a Segment Tree with Lazy Propagation to
 * efficiently manage seat availability across journey segments.
 * 
 * Time Complexity: O(log M) per operation where M = number of stations
 * Space Complexity: O(4*M) per seat for the segment tree
 * 
 * ===================================================================
 * HOW THE SEGMENT TREE WORKS
 * ===================================================================
 * 
 * CONCEPT:
 * Each seat has its own segment tree. The tree tracks which journey
 * segments are occupied. For example, with 10 stations, we have 9
 * segments: [0,1), [1,2), [2,3), ..., [8,9)
 * 
 * TREE STRUCTURE:
 * The segment tree is a binary tree where:
 * - Leaf nodes represent individual segments
 * - Internal nodes represent ranges of segments
 * - Each node stores the MAXIMUM occupancy in its range
 * 
 * Example with 4 segments [0,1), [1,2), [2,3), [3,4):
 * 
 *                    [0,4) Max=1          <- Root covers all segments
 *                   /              \
 *              [0,2) Max=1          [2,4) Max=0
 *             /         \           /         \
 *        [0,1) M=0   [1,2) M=1  [2,3) M=0  [3,4) M=0  <- Leaves
 * 
 * This tree indicates seat is booked for segment [1,2) only.
 * 
 * BOOKING OPERATION:
 * When booking from station L to R:
 * 1. Query: Check if max occupancy in range [L, R) is 0
 * 2. If yes, Update: Add +1 to all segments in range [L, R)
 * 3. Tree nodes update to reflect new maximum
 * 
 * LAZY PROPAGATION:
 * Instead of updating all nodes immediately, we:
 * - Mark parent nodes with a "lazy" value
 * - Push lazy values down only when needed (during queries/updates)
 * - This makes range updates O(log M) instead of O(M)
 * 
 * Example: Booking [1,3) adds +1 to segments [1,2) and [2,3)
 * The tree marks ranges with lazy values and propagates on demand.
 * 
 * AVAILABILITY CHECK:
 * To check if seat is available for journey [L, R):
 * - Query maximum occupancy in range [L, R)
 * - If max == 0: all segments free, seat available
 * - If max > 0: at least one segment occupied, seat unavailable
 * 
 * ===================================================================
 */

// ======================== SEGMENT TREE CLASS ========================

/**
 * Segment Tree with Lazy Propagation for range max queries and updates.
 * 
 * Each node stores the maximum value in its range. This allows us to
 * quickly check if ANY segment in a range is occupied (max > 0).
 */
class SegmentTree {
    /**
     * Initialize segment tree for n elements (stations/segments)
     * @param {number} n - Number of segments (stations - 1)
     */
    constructor(n) {
        this.n = n;
        // Tree size: 4*n is sufficient for complete binary tree
        this.tree = new Array(4 * n).fill(0);
        this.lazy = new Array(4 * n).fill(0);
    }

    /**
     * Push down lazy values to children before accessing them.
     * This ensures the tree maintains correct values during traversal.
     * 
     * @param {number} node - Current node index
     */
    pushDown(node) {
        if (this.lazy[node] !== 0) {
            const leftChild = 2 * node + 1;
            const rightChild = 2 * node + 2;

            // Propagate lazy value to children
            this.tree[leftChild] += this.lazy[node];
            this.tree[rightChild] += this.lazy[node];
            this.lazy[leftChild] += this.lazy[node];
            this.lazy[rightChild] += this.lazy[node];

            // Clear current lazy value
            this.lazy[node] = 0;
        }
    }

    /**
     * Range update: Add val to all elements in [l, r)
     * Used for booking (+1) and cancellation (-1)
     * 
     * @param {number} l - Start of range (inclusive)
     * @param {number} r - End of range (exclusive)
     * @param {number} val - Value to add (+1 for book, -1 for cancel)
     * @param {number} node - Current node (default: root = 0)
     * @param {number} start - Node's range start (default: 0)
     * @param {number} end - Node's range end (default: n)
     */
    update(l, r, val, node = 0, start = 0, end = this.n) {
        // No overlap
        if (r <= start || end <= l) {
            return;
        }

        // Complete overlap - apply lazy update
        if (l <= start && end <= r) {
            this.tree[node] += val;
            this.lazy[node] += val;
            return;
        }

        // Partial overlap - recurse to children
        this.pushDown(node);
        const mid = Math.floor((start + end) / 2);
        this.update(l, r, val, 2 * node + 1, start, mid);
        this.update(l, r, val, 2 * node + 2, mid, end);

        // Update current node from children (read their current effective values)
        // Note: After pushDown, children have lazy values but tree values are current
        const leftChild = 2 * node + 1;
        const rightChild = 2 * node + 2;
        this.tree[node] = Math.max(
            this.tree[leftChild] + this.lazy[leftChild],
            this.tree[rightChild] + this.lazy[rightChild]
        );
    }

    /**
     * Range query: Get maximum value in [l, r)
     * If max > 0, the range has at least one occupied segment
     * 
     * @param {number} l - Start of range (inclusive)
     * @param {number} r - End of range (exclusive)
     * @param {number} node - Current node (default: root = 0)
     * @param {number} start - Node's range start (default: 0)
     * @param {number} end - Node's range end (default: n)
     * @returns {number} Maximum occupancy in the range
     */
    query(l, r, node = 0, start = 0, end = this.n) {
        // No overlap
        if (r <= start || end <= l) {
            return 0;
        }

        // Complete overlap - return node value
        if (l <= start && end <= r) {
            return this.tree[node];
        }

        // Partial overlap - query children
        this.pushDown(node);
        const mid = Math.floor((start + end) / 2);
        const leftMax = this.query(l, r, 2 * node + 1, start, mid);
        const rightMax = this.query(l, r, 2 * node + 2, mid, end);

        return Math.max(leftMax, rightMax);
    }

    /**
     * Get tree structure for visualization
     * 
     * This builds a level-by-level view of the segment tree, showing the
     * EFFECTIVE value of each node (tree value + all pending lazy updates).
     * 
     * The visualization helps understand the current state of the tree:
     * - Level 0: Root node covering entire range [0, n)
     * - Level 1: Two nodes covering [0, mid) and [mid, n)
     * - Level 2: Four nodes for quarter ranges
     * - And so on...
     * 
     * Each node's value represents the MAXIMUM occupancy in its range.
     * 
     * @returns {Array} Array of levels, each containing node objects with range info
     */
    getTreeVisualization() {
        const levels = [];
        
        // Early termination if tree is empty
        if (this.n === 0) return levels;

        // Build tree level by level
        const buildLevel = (nodes) => {
            const level = [];
            const nextNodes = [];

            for (const { node, start, end, accLazy } of nodes) {
                // Skip invalid ranges
                if (start >= end || start >= this.n) continue;

                // Calculate effective value:
                // This is what the node REALLY represents after all pending updates
                // = stored tree value + accumulated lazy from all ancestors
                const effectiveVal = this.tree[node] + accLazy;
                
                // Store node info with range for better visualization
                level.push({
                    value: effectiveVal,
                    range: `[${start},${Math.min(end, this.n)})`
                });

                // Only add children if we haven't reached leaf level
                if (end - start > 1) {
                    // Calculate how lazy values propagate to children:
                    // Children inherit parent's accumulated lazy + parent's own lazy
                    const childAccLazy = accLazy + this.lazy[node];
                    const mid = Math.floor((start + end) / 2);
                    
                    nextNodes.push({ 
                        node: 2 * node + 1, 
                        start: start, 
                        end: mid, 
                        accLazy: childAccLazy 
                    });
                    nextNodes.push({ 
                        node: 2 * node + 2, 
                        start: mid, 
                        end: end, 
                        accLazy: childAccLazy 
                    });
                }
            }

            if (level.length > 0) {
                levels.push(level);
                // Limit depth to keep visualization manageable
                if (levels.length < 5 && nextNodes.length > 0) {
                    buildLevel(nextNodes);
                }
            }
        };

        // Start from root with no accumulated lazy
        buildLevel([{ node: 0, start: 0, end: this.n, accLazy: 0 }]);

        return levels;
    }
}

// ====================== SEAT BOOKING SYSTEM =========================

/**
 * Main booking system managing N seats across M stations.
 * Each seat has its own segment tree for O(log M) operations.
 */
class SeatBookingSystem {
    /**
     * Initialize booking system
     * @param {number} numSeats - Number of seats (N)
     * @param {number} numStations - Number of stations (M)
     */
    constructor(numSeats, numStations) {
        this.numSeats = numSeats;
        this.numStations = numStations;
        this.numSegments = numStations - 1; // Journey segments

        // Create a segment tree for each seat (for individual seat availability)
        this.seats = [];
        for (let i = 0; i < numSeats; i++) {
            this.seats.push(new SegmentTree(this.numSegments));
        }

        // Global segment tree tracking COUNT of seats booked per segment
        // This shows how many seats are booked for each segment
        this.globalTree = new SegmentTree(this.numSegments);

        // Track all bookings for display and management
        this.bookings = [];
        this.operationCount = 0;
    }

    /**
     * Book a seat for journey from station l to station r
     * 
     * @param {number} seatId - Seat index (0-based)
     * @param {number} l - Start station (inclusive)
     * @param {number} r - End station (exclusive)
     * @returns {{success: boolean, message: string}}
     */
    book(seatId, l, r) {
        this.operationCount++;

        // Validate inputs
        if (seatId < 0 || seatId >= this.numSeats) {
            return { success: false, message: `Invalid seat ID: ${seatId}` };
        }
        if (l < 0 || r > this.numStations || l >= r) {
            return { success: false, message: `Invalid station range: [${l}, ${r})` };
        }

        // Check availability - if max occupancy > 0, seat is taken
        const maxOccupancy = this.seats[seatId].query(l, r);

        if (maxOccupancy > 0) {
            // Find which bookings conflict
            const conflicts = this.bookings.filter(
                b => b.seatId === seatId && b.active && b.from < r && b.to > l
            ).map(b => `${b.from + 1}-${b.to + 1}`);

            return {
                success: false,
                message: `Seat ${seatId + 1} already booked for ${conflicts.join(', ')}`
            };
        }

        // Book the seat - increment occupancy in range
        this.seats[seatId].update(l, r, 1);

        // Update global count of seats booked per segment
        this.globalTree.update(l, r, 1);

        // Track booking
        const booking = {
            id: this.bookings.length + 1,
            seatId,
            from: l,
            to: r,
            active: true,
            timestamp: new Date()
        };
        this.bookings.push(booking);

        return {
            success: true,
            message: `Seat ${seatId + 1} booked from station ${l + 1} to ${r + 1}`,
            bookingId: booking.id
        };
    }

    /**
     * Cancel a booking for a seat in the given range
     * 
     * @param {number} seatId - Seat index (0-based)
     * @param {number} l - Start station (inclusive)
     * @param {number} r - End station (exclusive)
     * @returns {{success: boolean, message: string}}
     */
    cancel(seatId, l, r) {
        this.operationCount++;

        // Validate inputs
        if (seatId < 0 || seatId >= this.numSeats) {
            return { success: false, message: `Invalid seat ID: ${seatId}` };
        }
        if (l < 0 || r > this.numStations || l >= r) {
            return { success: false, message: `Invalid station range: [${l}, ${r})` };
        }

        // Only allow cancelling if there's an exact matching active booking
        const booking = this.bookings.find(
            b => b.seatId === seatId && b.from === l && b.to === r && b.active
        );

        if (!booking) {
            return {
                success: false,
                message: `No booking found for seat ${seatId + 1} from stations ${l + 1}-${r + 1}`
            };
        }

        // Cancel - decrement occupancy in range
        this.seats[seatId].update(l, r, -1);

        // Update global count
        this.globalTree.update(l, r, -1);

        // Mark booking as inactive
        booking.active = false;

        return {
            success: true,
            message: `Booking cancelled for seat ${seatId + 1} from station ${l + 1} to ${r + 1}`
        };
    }

    /**
     * Find all seats available for the given journey range
     * 
     * @param {number} l - Start station (inclusive)
     * @param {number} r - End station (exclusive)
     * @returns {{available: number[], message: string}}
     */
    queryAvailable(l, r) {
        this.operationCount++;

        if (l < 0 || r > this.numStations || l >= r) {
            return { available: [], message: `Invalid station range: [${l}, ${r})` };
        }

        const available = [];

        for (let seatId = 0; seatId < this.numSeats; seatId++) {
            const maxOccupancy = this.seats[seatId].query(l, r);
            if (maxOccupancy === 0) {
                available.push(seatId);
            }
        }

        const message = available.length > 0
            ? `${available.length} seat(s) available for stations ${l + 1}-${r + 1}`
            : `No seats available for stations ${l + 1}-${r + 1}`;

        return { available, message };
    }

    /**
     * Check if a specific seat is available for a range
     * 
     * @param {number} seatId - Seat index (0-based)
     * @param {number} l - Start station (inclusive)
     * @param {number} r - End station (exclusive)
     * @returns {boolean}
     */
    isAvailable(seatId, l, r) {
        if (seatId < 0 || seatId >= this.numSeats) return false;
        if (l < 0 || r > this.numStations || l >= r) return false;

        return this.seats[seatId].query(l, r) === 0;
    }

    /**
     * Get seat status: 'available', 'booked', or 'partial'
     * 
     * @param {number} seatId - Seat index (0-based)
     * @returns {string} Status string
     */
    getSeatStatus(seatId) {
        if (seatId < 0 || seatId >= this.numSeats) return 'available';

        // Check entire journey
        const maxOccupancy = this.seats[seatId].query(0, this.numSegments);

        if (maxOccupancy === 0) {
            return 'available';
        }

        // Check if fully booked (all segments occupied)
        let allBooked = true;
        for (let i = 0; i < this.numSegments; i++) {
            if (this.seats[seatId].query(i, i + 1) === 0) {
                allBooked = false;
                break;
            }
        }

        return allBooked ? 'booked' : 'partial';
    }

    /**
     * Get active booking count
     * @returns {number}
     */
    getActiveBookings() {
        return this.bookings.filter(b => b.active).length;
    }

    /**
     * Get global segment tree visualization showing seats booked per segment
     * @returns {Array} Tree levels with seat counts
     */
    getGlobalTreeVisualization() {
        return this.globalTree.getTreeVisualization();
    }

    /**
     * Get segment tree for a specific seat
     * @param {number} seatId - Seat index
     * @returns {Array} Tree levels
     */
    getTreeVisualization(seatId) {
        if (seatId < 0 || seatId >= this.numSeats) return [];
        return this.seats[seatId].getTreeVisualization();
    }
}

// ========================== UI CONTROLLER ===========================

/**
 * UI Controller managing DOM interactions and visual feedback
 */
class UIController {
    constructor() {
        // Configuration
        this.NUM_SEATS = 24;      // 24 seats (3 rows of 8)
        this.NUM_STATIONS = 10;   // 10 stations

        // Initialize booking system
        this.system = new SeatBookingSystem(this.NUM_SEATS, this.NUM_STATIONS);

        // State
        this.selectedSeat = null;

        // DOM Elements
        this.elements = {
            fromStation: document.getElementById('fromStation'),
            toStation: document.getElementById('toStation'),
            seatGrid: document.getElementById('seatGrid'),
            journeyProgress: document.getElementById('journeyProgress'),
            stationMarkers: document.getElementById('stationMarkers'),
            treeContainer: document.getElementById('treeContainer'),
            historyLog: document.getElementById('historyLog'),
            bookBtn: document.getElementById('bookBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            queryBtn: document.getElementById('queryBtn'),
            toastContainer: document.getElementById('toastContainer'),
            // Stats
            totalSeats: document.getElementById('totalSeats'),
            totalStations: document.getElementById('totalStations'),
            activeBookings: document.getElementById('activeBookings')
        };

        // Initialize
        this.init();
    }

    init() {
        this.populateStationSelects();
        this.createSeatGrid();
        this.createStationMarkers();
        this.updateJourneyVisual();
        this.updateStats();
        this.updateTreeVisualization();
        this.bindEvents();
    }

    /**
     * Populate station dropdown selects
     */
    populateStationSelects() {
        for (let i = 0; i < this.NUM_STATIONS; i++) {
            const option1 = document.createElement('option');
            option1.value = i;
            option1.textContent = `Station ${i + 1}`;
            this.elements.fromStation.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = i;
            option2.textContent = `Station ${i + 1}`;
            this.elements.toStation.appendChild(option2);
        }

        // Default selection
        this.elements.fromStation.value = 0;
        this.elements.toStation.value = 4;
    }

    /**
     * Create the seat grid UI
     */
    createSeatGrid() {
        this.elements.seatGrid.innerHTML = '';

        for (let i = 0; i < this.NUM_SEATS; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.dataset.seatId = i;
            seat.textContent = i + 1;
            seat.addEventListener('click', () => this.selectSeat(i));
            this.elements.seatGrid.appendChild(seat);
        }
    }

    /**
     * Create station markers below the journey track
     */
    createStationMarkers() {
        this.elements.stationMarkers.innerHTML = '';

        for (let i = 0; i < this.NUM_STATIONS; i++) {
            const marker = document.createElement('div');
            marker.className = 'station-marker';
            marker.innerHTML = `
                <div class="station-dot" data-station="${i}"></div>
                <span class="station-label">${i + 1}</span>
            `;
            this.elements.stationMarkers.appendChild(marker);
        }
    }

    /**
     * Update journey progress bar visual
     */
    updateJourneyVisual() {
        const from = parseInt(this.elements.fromStation.value);
        const to = parseInt(this.elements.toStation.value);

        // Update progress bar
        const startPercent = (from / (this.NUM_STATIONS - 1)) * 100;
        const widthPercent = ((to - from) / (this.NUM_STATIONS - 1)) * 100;

        this.elements.journeyProgress.style.marginLeft = `${startPercent}%`;
        this.elements.journeyProgress.style.width = `${Math.max(0, widthPercent)}%`;

        // Update station dots
        const dots = document.querySelectorAll('.station-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'in-range');
            if (i === from || i === to) {
                dot.classList.add('active');
            } else if (i > from && i < to) {
                dot.classList.add('in-range');
            }
        });
    }

    /**
     * Select a seat
     */
    selectSeat(seatId) {
        // Update selection
        this.selectedSeat = seatId;

        // Update seat visuals
        const seats = this.elements.seatGrid.querySelectorAll('.seat');
        seats.forEach((seat, i) => {
            seat.classList.remove('selected', 'available-result');
            if (i === seatId) {
                seat.classList.add('selected');
            }
        });

        // Update tree visualization
        this.updateTreeVisualization();
    }

    /**
     * Update seat grid colors based on booking status
     */
    updateSeatGrid() {
        const seats = this.elements.seatGrid.querySelectorAll('.seat');
        const from = parseInt(this.elements.fromStation.value);
        const to = parseInt(this.elements.toStation.value);

        seats.forEach((seat, i) => {
            const status = this.system.getSeatStatus(i);
            const isAvailableForRange = this.system.isAvailable(i, from, to);

            seat.classList.remove('booked', 'partial', 'available-result');

            if (status === 'booked') {
                seat.classList.add('booked');
            } else if (status === 'partial') {
                if (!isAvailableForRange) {
                    seat.classList.add('partial');
                }
            }
        });
    }

    /**
     * Visualize segment tree for selected seat
     */
    updateTreeVisualization() {
        if (this.selectedSeat === null) {
            this.elements.treeContainer.innerHTML =
                '<p class="placeholder-text">Select a seat to view its segments</p>';
            return;
        }

        const levels = this.system.getTreeVisualization(this.selectedSeat);

        if (levels.length === 0) {
            this.elements.treeContainer.innerHTML =
                '<p class="placeholder-text">No data</p>';
            return;
        }

        let html = `<div style="text-align: center; margin-bottom: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
            Seat ${this.selectedSeat + 1} - Segments Booked
        </div>`;

        levels.forEach((level, levelIdx) => {
            if (levelIdx > 4) return;
            html += '<div class="tree-level">';
            level.forEach(val => {
                const nodeClass = val > 0 ? 'tree-node booked' : 'tree-node';
                html += `<div class="${nodeClass}">${val}</div>`;
            });
            html += '</div>';
        });

        this.elements.treeContainer.innerHTML = html;
    }

    /**
     * Update statistics display
     */
    updateStats() {
        this.elements.totalSeats.textContent = this.NUM_SEATS;
        this.elements.totalStations.textContent = this.NUM_STATIONS;
        this.elements.activeBookings.textContent = this.system.getActiveBookings();
    }

    /**
     * Add entry to booking history log
     */
    addLogEntry(message, type = 'info') {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;

        // Remove welcome message if present
        const welcome = this.elements.historyLog.querySelector('.welcome');
        if (welcome) welcome.remove();

        // Add to top
        this.elements.historyLog.insertBefore(entry, this.elements.historyLog.firstChild);

        // Limit history
        while (this.elements.historyLog.children.length > 20) {
            this.elements.historyLog.removeChild(this.elements.historyLog.lastChild);
        }
    }

    /**
     * Show toast notification
     */
    showToast(title, message, type = 'info') {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Station selection change
        this.elements.fromStation.addEventListener('change', () => {
            this.updateJourneyVisual();
            this.updateSeatGrid();
        });

        this.elements.toStation.addEventListener('change', () => {
            this.updateJourneyVisual();
            this.updateSeatGrid();
        });

        // Book button
        this.elements.bookBtn.addEventListener('click', () => {
            this.handleBook();
        });

        // Cancel button
        this.elements.cancelBtn.addEventListener('click', () => {
            this.handleCancel();
        });

        // Query button
        this.elements.queryBtn.addEventListener('click', () => {
            this.handleQuery();
        });
    }

    /**
     * Handle booking action
     */
    handleBook() {
        if (this.selectedSeat === null) {
            this.showToast('No Seat Selected', 'Please select a seat first', 'error');
            return;
        }

        const from = parseInt(this.elements.fromStation.value);
        const to = parseInt(this.elements.toStation.value);

        if (from >= to) {
            this.showToast('Invalid Range', 'Departure must be before arrival', 'error');
            return;
        }

        const result = this.system.book(this.selectedSeat, from, to);

        if (result.success) {
            this.showToast('Booking Confirmed', result.message, 'success');
            this.addLogEntry(`Booked: ${result.message}`, 'success');
        } else {
            this.showToast('Booking Failed', result.message, 'error');
            this.addLogEntry(`Failed: ${result.message}`, 'error');
        }

        this.updateSeatGrid();
        this.updateStats();
        this.updateTreeVisualization();
    }

    /**
     * Handle cancellation action
     */
    handleCancel() {
        if (this.selectedSeat === null) {
            this.showToast('No Seat Selected', 'Please select a seat first', 'error');
            return;
        }

        const from = parseInt(this.elements.fromStation.value);
        const to = parseInt(this.elements.toStation.value);

        if (from >= to) {
            this.showToast('Invalid Range', 'Departure must be before arrival', 'error');
            return;
        }

        const result = this.system.cancel(this.selectedSeat, from, to);

        if (result.success) {
            this.showToast('Cancelled', result.message, 'success');
            this.addLogEntry(`Cancelled: ${result.message}`, 'success');
        } else {
            this.showToast('Cancel Failed', result.message, 'error');
            this.addLogEntry(`Failed: ${result.message}`, 'error');
        }

        this.updateSeatGrid();
        this.updateStats();
        this.updateTreeVisualization();
    }

    /**
     * Handle availability query
     */
    handleQuery() {
        const from = parseInt(this.elements.fromStation.value);
        const to = parseInt(this.elements.toStation.value);

        if (from >= to) {
            this.showToast('Invalid Range', 'Departure must be before arrival', 'error');
            return;
        }

        const result = this.system.queryAvailable(from, to);

        // Highlight available seats
        const seats = this.elements.seatGrid.querySelectorAll('.seat');
        seats.forEach((seat, i) => {
            seat.classList.remove('available-result');
            if (result.available.includes(i)) {
                seat.classList.add('available-result');
            }
        });

        if (result.available.length > 0) {
            this.showToast('Seats Found', result.message, 'success');
            this.addLogEntry(`Query: ${result.message}`, 'info');
        } else {
            this.showToast('No Availability', result.message, 'error');
            this.addLogEntry(`Query: ${result.message}`, 'error');
        }

        this.updateStats();
    }
}

// ========================= INITIALIZE APP ===========================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Create UI controller
    const app = new UIController();

    // Run demo bookings after a short delay
    setTimeout(() => {
        console.log('Seat Booking System initialized');
        console.log(`  ${app.NUM_SEATS} seats, ${app.NUM_STATIONS} stations`);
        console.log('  Using Segment Tree with Lazy Propagation');
    }, 500);
});
