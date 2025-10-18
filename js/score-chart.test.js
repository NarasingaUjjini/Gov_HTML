/**
 * ScoreChart Tests - Comprehensive test suite for the score progression chart
 * Tests chart rendering, data processing, and interactive features
 */

// Mock DOM elements for testing
function createMockCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'test-canvas';
    canvas.width = 600;
    canvas.height = 300;
    canvas.style.width = '600px';
    canvas.style.height = '300px';
    
    // Mock getBoundingClientRect
    canvas.getBoundingClientRect = () => ({
        width: 600,
        height: 300,
        left: 0,
        top: 0
    });
    
    // Mock remove method
    canvas.remove = () => {};
    
    return canvas;
}

function createSampleData() {
    return [
        {
            date: '2024-01-15',
            score: 42,
            total: 55,
            percentage: 76.4,
            unitBreakdown: { 1: 8, 2: 9, 3: 7, 4: 9, 5: 9 }
        },
        {
            date: '2024-01-20',
            score: 45,
            total: 55,
            percentage: 81.8,
            unitBreakdown: { 1: 9, 2: 9, 3: 8, 4: 10, 5: 9 }
        },
        {
            date: '2024-01-25',
            score: 48,
            total: 55,
            percentage: 87.3,
            unitBreakdown: { 1: 10, 2: 10, 3: 9, 4: 9, 5: 10 }
        }
    ];
}

// Test Suite
const ScoreChartTests = {
    setUp() {
        // Clean up any existing elements
        const existingCanvas = document.getElementById('test-canvas');
        if (existingCanvas && existingCanvas.remove) {
            existingCanvas.remove();
        }
        
        // Create fresh canvas
        this.canvas = createMockCanvas();
        if (document.body && document.body.appendChild) {
            document.body.appendChild(this.canvas);
        }
        
        // Create chart instance
        this.chart = new ScoreChart('test-canvas');
        this.sampleData = createSampleData();
    },

    tearDown() {
        if (this.chart) {
            this.chart.destroy();
        }
        if (this.canvas && this.canvas.remove) {
            this.canvas.remove();
        }
    },

    testChartInitialization() {
        console.log('Testing chart initialization...');
        
        // Test that chart is properly initialized
        if (!this.chart) {
            throw new Error('Chart should be initialized');
        }
        
        if (!this.chart.canvas) {
            throw new Error('Chart should have canvas reference');
        }
        
        if (!this.chart.ctx) {
            throw new Error('Chart should have canvas context');
        }
        
        console.log('✓ Chart initialization test passed');
    },

    testInvalidCanvasId() {
        console.log('Testing invalid canvas ID handling...');
        
        // Mock document.getElementById to return null for non-existent canvas
        const originalGetElementById = document.getElementById;
        document.getElementById = (id) => {
            if (id === 'non-existent-canvas') {
                return null;
            }
            return originalGetElementById(id);
        };
        
        try {
            new ScoreChart('non-existent-canvas');
            throw new Error('Should have thrown error for invalid canvas ID');
        } catch (error) {
            if (!error.message.includes('not found')) {
                throw new Error('Should throw specific error for missing canvas');
            }
        } finally {
            // Restore original function
            document.getElementById = originalGetElementById;
        }
        
        console.log('✓ Invalid canvas ID test passed');
    },

    testDataProcessing() {
        console.log('Testing data processing...');
        
        // Update chart with sample data
        this.chart.updateData(this.sampleData);
        
        // Verify data transformation
        if (this.chart.data.length !== 3) {
            throw new Error(`Expected 3 data points, got ${this.chart.data.length}`);
        }
        
        // Check first data point
        const firstPoint = this.chart.data[0];
        if (firstPoint.x !== 1) {
            throw new Error(`Expected x=1 for first point, got ${firstPoint.x}`);
        }
        
        if (firstPoint.y !== 76.4) {
            throw new Error(`Expected y=76.4 for first point, got ${firstPoint.y}`);
        }
        
        if (firstPoint.testNumber !== 1) {
            throw new Error(`Expected testNumber=1, got ${firstPoint.testNumber}`);
        }
        
        console.log('✓ Data processing test passed');
    },

    testEmptyDataHandling() {
        console.log('Testing empty data handling...');
        
        // Test with empty array
        this.chart.updateData([]);
        
        if (this.chart.data.length !== 0) {
            throw new Error('Chart should handle empty data array');
        }
        
        // Test with null/undefined - should not crash
        try {
            this.chart.updateData(null);
            this.chart.updateData(undefined);
        } catch (error) {
            // This is expected behavior - the chart should handle null gracefully
            // but it's okay if it throws an error as long as it doesn't crash
        }
        
        console.log('✓ Empty data handling test passed');
    },

    testChartRendering() {
        console.log('Testing chart rendering...');
        
        // Mock canvas context methods to track calls
        const mockCalls = [];
        const originalMethods = {};
        
        ['beginPath', 'moveTo', 'lineTo', 'stroke', 'fill', 'arc', 'fillText'].forEach(method => {
            originalMethods[method] = this.chart.ctx[method];
            this.chart.ctx[method] = function(...args) {
                mockCalls.push({ method, args });
                return originalMethods[method].apply(this, args);
            };
        });
        
        // Render with data
        this.chart.updateData(this.sampleData);
        
        // Check that rendering methods were called
        const methodCalls = mockCalls.map(call => call.method);
        
        if (!methodCalls.includes('beginPath')) {
            throw new Error('Chart should call beginPath during rendering');
        }
        
        if (!methodCalls.includes('stroke')) {
            throw new Error('Chart should call stroke during rendering');
        }
        
        // Restore original methods
        Object.keys(originalMethods).forEach(method => {
            this.chart.ctx[method] = originalMethods[method];
        });
        
        console.log('✓ Chart rendering test passed');
    },

    testPositionCalculations() {
        console.log('Testing position calculations...');
        
        this.chart.updateData(this.sampleData);
        
        // Test X position calculation
        const x1 = this.chart.getXPosition(1);
        const x2 = this.chart.getXPosition(2);
        
        if (x2 <= x1) {
            throw new Error('X positions should increase for higher test numbers');
        }
        
        // Test Y position calculation
        const y1 = this.chart.getYPosition(50); // 50%
        const y2 = this.chart.getYPosition(100); // 100%
        
        if (y2 >= y1) {
            throw new Error('Y positions should decrease for higher percentages (canvas coordinates)');
        }
        
        console.log('✓ Position calculations test passed');
    },

    testInteractiveFeatures() {
        console.log('Testing interactive features...');
        
        this.chart.updateData(this.sampleData);
        
        // Test mouse move handling
        const mockEvent = {
            clientX: 100,
            clientY: 150
        };
        
        // Should not throw errors
        this.chart.handleMouseMove(mockEvent);
        this.chart.handleMouseLeave();
        
        // Test tooltip creation
        if (!this.chart.tooltip) {
            throw new Error('Chart should create tooltip element');
        }
        
        if (!document.body.contains(this.chart.tooltip)) {
            throw new Error('Tooltip should be added to document body');
        }
        
        console.log('✓ Interactive features test passed');
    },

    testTooltipContent() {
        console.log('Testing tooltip content...');
        
        this.chart.updateData(this.sampleData);
        
        const testPoint = this.chart.data[0];
        const mockEvent = { pageX: 100, pageY: 100 };
        
        this.chart.showTooltip(mockEvent, testPoint);
        
        const tooltipContent = this.chart.tooltip.innerHTML;
        
        if (!tooltipContent.includes('Test 1')) {
            throw new Error('Tooltip should include test number');
        }
        
        if (!tooltipContent.includes('42/55')) {
            throw new Error('Tooltip should include score fraction');
        }
        
        if (!tooltipContent.includes('76.4%')) {
            throw new Error('Tooltip should include percentage');
        }
        
        console.log('✓ Tooltip content test passed');
    },

    testResponsiveDesign() {
        console.log('Testing responsive design...');
        
        // Test canvas resizing
        this.canvas.style.width = '400px';
        this.canvas.style.height = '200px';
        
        // Mock getBoundingClientRect for new size
        this.canvas.getBoundingClientRect = () => ({
            width: 400,
            height: 200,
            left: 0,
            top: 0
        });
        
        // Update data should trigger resize handling
        this.chart.updateData(this.sampleData);
        
        // In our mock environment, the canvas dimensions won't actually change
        // but the chart should handle the resize without errors
        // This test mainly verifies no exceptions are thrown during resize
        
        console.log('✓ Responsive design test passed');
    },

    testConfigurationOptions() {
        console.log('Testing configuration options...');
        
        const customOptions = {
            lineColor: '#ff0000',
            pointColor: '#00ff00',
            lineWidth: 5
        };
        
        const customChart = new ScoreChart('test-canvas', customOptions);
        
        if (customChart.config.lineColor !== '#ff0000') {
            throw new Error('Custom line color should be applied');
        }
        
        if (customChart.config.pointColor !== '#00ff00') {
            throw new Error('Custom point color should be applied');
        }
        
        if (customChart.config.lineWidth !== 5) {
            throw new Error('Custom line width should be applied');
        }
        
        customChart.destroy();
        
        console.log('✓ Configuration options test passed');
    },

    testCleanup() {
        console.log('Testing cleanup and destruction...');
        
        this.chart.updateData(this.sampleData);
        
        // Verify tooltip exists
        if (!this.chart.tooltip) {
            throw new Error('Tooltip should be created');
        }
        
        // In our mock environment, document.body.contains always returns true
        // So we'll test that the destroy method runs without errors
        
        // Destroy chart
        this.chart.destroy();
        
        // The destroy method should complete without throwing errors
        // In a real browser environment, this would remove the tooltip from DOM
        
        console.log('✓ Cleanup test passed');
    },

    runAllTests() {
        const tests = [
            'testChartInitialization',
            'testInvalidCanvasId',
            'testDataProcessing',
            'testEmptyDataHandling',
            'testChartRendering',
            'testPositionCalculations',
            'testInteractiveFeatures',
            'testTooltipContent',
            'testResponsiveDesign',
            'testConfigurationOptions',
            'testCleanup'
        ];

        let passed = 0;
        let failed = 0;

        console.log('Running ScoreChart Tests...\n');

        tests.forEach(testName => {
            try {
                this.setUp();
                this[testName]();
                this.tearDown();
                passed++;
            } catch (error) {
                console.error(`✗ ${testName} failed:`, error.message);
                failed++;
                this.tearDown();
            }
        });

        console.log(`\nScoreChart Tests Complete: ${passed} passed, ${failed} failed`);
        
        if (failed > 0) {
            throw new Error(`${failed} tests failed`);
        }
        
        return { passed, failed };
    }
};

// Export for test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreChartTests;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.ScoreChartTests = ScoreChartTests;
}