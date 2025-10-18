/**
 * ScoreChart - Canvas-based line chart for displaying practice test score progression
 * Provides interactive features like hover tooltips and responsive design
 */
class ScoreChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.hoveredPoint = null;
        this.tooltip = null;
        
        // Chart configuration
        this.config = {
            padding: { top: 40, right: 40, bottom: 60, left: 60 },
            gridColor: '#e9ecef',
            axisColor: '#6c757d',
            lineColor: '#4A90E2',
            pointColor: '#4A90E2',
            pointHoverColor: '#357abd',
            pointRadius: 4,
            pointHoverRadius: 6,
            lineWidth: 3,
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            tooltipBg: '#333',
            tooltipText: '#fff',
            ...options
        };
        
        this.setupEventListeners();
        this.setupTooltip();
    }

    /**
     * Set up event listeners for interactivity
     */
    setupEventListeners() {
        // Mouse events for desktop
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Handle window resize for responsive design
        window.addEventListener('resize', () => this.debounce(() => this.render(), 250));
    }

    /**
     * Create tooltip element for hover interactions
     */
    setupTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'score-chart-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: ${this.config.tooltipBg};
            color: ${this.config.tooltipText};
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: ${this.config.fontFamily};
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            white-space: nowrap;
        `;
        document.body.appendChild(this.tooltip);
    }

    /**
     * Update chart data and re-render
     * @param {Array} practiceTests - Array of practice test records
     */
    updateData(practiceTests) {
        if (!practiceTests || !Array.isArray(practiceTests)) {
            this.data = [];
        } else {
            this.data = practiceTests.map((test, index) => ({
                x: index + 1, // Test number
                y: test.percentage, // Score percentage
                date: new Date(test.date),
                score: test.score,
                total: test.total,
                testNumber: index + 1
            }));
        }
        
        this.render();
    }

    /**
     * Render the complete chart
     */
    render() {
        if (!this.data || this.data.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.setupCanvas();
        this.drawGrid();
        this.drawAxes();
        this.drawLine();
        this.drawPoints();
        this.drawLabels();
    }

    /**
     * Set up canvas dimensions and clear
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Adjust padding for mobile devices
        const isMobile = window.innerWidth <= 768;
        const mobilePadding = { top: 30, right: 30, bottom: 50, left: 50 };
        const currentPadding = isMobile ? mobilePadding : this.config.padding;
        
        // Set actual canvas size for crisp rendering
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context for high DPI displays
        this.ctx.scale(dpr, dpr);
        
        // Set CSS size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Clear canvas
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Calculate chart dimensions with mobile-adjusted padding
        this.chartWidth = rect.width - currentPadding.left - currentPadding.right;
        this.chartHeight = rect.height - currentPadding.top - currentPadding.bottom;
        this.chartX = currentPadding.left;
        this.chartY = currentPadding.top;
        
        // Store current padding for use in other methods
        this.currentPadding = currentPadding;
    }

    /**
     * Draw grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);

        // Horizontal grid lines (for scores)
        for (let i = 0; i <= 10; i++) {
            const y = this.chartY + (i / 10) * this.chartHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartX, y);
            this.ctx.lineTo(this.chartX + this.chartWidth, y);
            this.ctx.stroke();
        }

        // Vertical grid lines (for tests)
        const maxTests = Math.max(this.data.length, 5);
        for (let i = 0; i <= maxTests; i++) {
            const x = this.chartX + (i / maxTests) * this.chartWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartY);
            this.ctx.lineTo(x, this.chartY + this.chartHeight);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    /**
     * Draw chart axes
     */
    drawAxes() {
        this.ctx.strokeStyle = this.config.axisColor;
        this.ctx.lineWidth = 2;

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartX, this.chartY);
        this.ctx.lineTo(this.chartX, this.chartY + this.chartHeight);
        this.ctx.stroke();

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartX, this.chartY + this.chartHeight);
        this.ctx.lineTo(this.chartX + this.chartWidth, this.chartY + this.chartHeight);
        this.ctx.stroke();
    }

    /**
     * Draw the score progression line
     */
    drawLine() {
        if (this.data.length < 2) return;

        this.ctx.strokeStyle = this.config.lineColor;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        
        this.data.forEach((point, index) => {
            const x = this.getXPosition(point.x);
            const y = this.getYPosition(point.y);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
    }

    /**
     * Draw data points
     */
    drawPoints() {
        this.data.forEach((point, index) => {
            const x = this.getXPosition(point.x);
            const y = this.getYPosition(point.y);
            const isHovered = this.hoveredPoint === index;
            
            this.ctx.fillStyle = isHovered ? this.config.pointHoverColor : this.config.pointColor;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            
            const radius = isHovered ? this.config.pointHoverRadius : this.config.pointRadius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    /**
     * Draw axis labels and values
     */
    drawLabels() {
        const isMobile = window.innerWidth <= 768;
        const fontSize = isMobile ? 10 : this.config.fontSize;
        
        this.ctx.fillStyle = this.config.axisColor;
        this.ctx.font = `${fontSize}px ${this.config.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Y-axis labels (scores) - show fewer labels on mobile
        this.ctx.textAlign = 'right';
        const yLabelStep = isMobile ? 2 : 1; // Show every other label on mobile
        for (let i = 0; i <= 10; i += yLabelStep) {
            const y = this.chartY + (i / 10) * this.chartHeight;
            const score = 100 - (i * 10); // Invert because canvas Y is top-down
            this.ctx.fillText(`${score}%`, this.chartX - 8, y);
        }

        // X-axis labels (test numbers) - abbreviated on mobile
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        const maxTests = Math.max(this.data.length, 5);
        
        for (let i = 1; i <= maxTests; i++) {
            const x = this.chartX + ((i - 0.5) / maxTests) * this.chartWidth;
            const label = isMobile ? `T${i}` : `Test ${i}`;
            this.ctx.fillText(label, x, this.chartY + this.chartHeight + 8);
        }

        // Axis titles - only show on larger screens or abbreviated on mobile
        if (!isMobile || window.innerWidth > 480) {
            this.ctx.save();
            this.ctx.translate(15, this.chartY + this.chartHeight / 2);
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const yAxisTitle = isMobile ? 'Score' : 'Score (%)';
            this.ctx.fillText(yAxisTitle, 0, 0);
            this.ctx.restore();

            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            const xAxisTitle = isMobile ? 'Test #' : 'Practice Test Number';
            this.ctx.fillText(xAxisTitle, 
                this.chartX + this.chartWidth / 2, 
                this.chartY + this.chartHeight + (isMobile ? 25 : 35));
        }
    }

    /**
     * Render empty state when no data is available
     */
    renderEmptyState() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Show the no-data message (handled by CSS)
        const noDataElement = document.getElementById('no-data-message');
        if (noDataElement) {
            noDataElement.style.display = 'flex';
        }
    }

    /**
     * Handle mouse move for hover interactions
     */
    handleMouseMove(event) {
        this.handleInteraction(event);
    }

    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        if (this.hoveredPoint !== null) {
            this.hoveredPoint = null;
            this.render();
            this.hideTooltip();
        }
    }

    /**
     * Handle touch start for mobile interaction
     */
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleInteraction(touch);
    }

    /**
     * Handle touch move for mobile interaction
     */
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleInteraction(touch);
    }

    /**
     * Handle touch end
     */
    handleTouchEnd() {
        // Keep tooltip visible for a moment on touch devices
        setTimeout(() => {
            if (this.hoveredPoint !== null) {
                this.hoveredPoint = null;
                this.render();
                this.hideTooltip();
            }
        }, 2000);
    }

    /**
     * Unified interaction handler for both mouse and touch
     */
    handleInteraction(event) {
        if (!this.data || this.data.length === 0) return;

        const rect = this.canvas.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        const interactionX = clientX - rect.left;
        const interactionY = clientY - rect.top;

        let closestPoint = null;
        let closestDistance = Infinity;
        const hoverRadius = window.innerWidth <= 768 ? 30 : 20; // Larger touch target on mobile

        this.data.forEach((point, index) => {
            const x = this.getXPosition(point.x);
            const y = this.getYPosition(point.y);
            const distance = Math.sqrt(Math.pow(interactionX - x, 2) + Math.pow(interactionY - y, 2));

            if (distance < hoverRadius && distance < closestDistance) {
                closestPoint = index;
                closestDistance = distance;
            }
        });

        if (closestPoint !== this.hoveredPoint) {
            this.hoveredPoint = closestPoint;
            this.render();
            
            if (closestPoint !== null) {
                this.showTooltip(event, this.data[closestPoint]);
            } else {
                this.hideTooltip();
            }
        }
    }

    /**
     * Show tooltip with test details
     */
    showTooltip(event, point) {
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        this.tooltip.innerHTML = `
            <div><strong>Test ${point.testNumber}</strong></div>
            <div>Score: ${point.score}/${point.total} (${point.y}%)</div>
            <div>Date: ${formatDate(point.date)}</div>
        `;

        // Position tooltip with mobile-friendly positioning
        const isMobile = window.innerWidth <= 768;
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        let left = (event.pageX || clientX) + 10;
        let top = (event.pageY || clientY) - 10;
        
        // Adjust positioning for mobile to prevent tooltip from going off-screen
        if (isMobile) {
            const tooltipWidth = 200; // Approximate tooltip width
            const tooltipHeight = 80; // Approximate tooltip height
            
            if (left + tooltipWidth > window.innerWidth) {
                left = (event.pageX || clientX) - tooltipWidth - 10;
            }
            
            if (top - tooltipHeight < 0) {
                top = (event.pageY || clientY) + 30;
            }
        }

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.opacity = '1';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    /**
     * Convert data X value to canvas X position
     */
    getXPosition(dataX) {
        const maxTests = Math.max(this.data.length, 5);
        return this.chartX + ((dataX - 0.5) / maxTests) * this.chartWidth;
    }

    /**
     * Convert data Y value to canvas Y position
     */
    getYPosition(dataY) {
        // Invert Y because canvas Y is top-down, but we want higher scores at top
        return this.chartY + this.chartHeight - (dataY / 100) * this.chartHeight;
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(func, wait);
    }

    /**
     * Destroy chart and clean up resources
     */
    destroy() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        
        // Remove mouse event listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        
        // Remove touch event listeners
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        window.removeEventListener('resize', this.render);
        
        clearTimeout(this.debounceTimeout);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreChart;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.ScoreChart = ScoreChart;
}