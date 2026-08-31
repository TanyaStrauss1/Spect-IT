/**
 * SPECT-IT PREMIUM DASHBOARD
 * Professional Analytics & Insights Dashboard
 */

class PremiumDashboard {
    constructor() {
        this.analytics = new PremiumTestAnalytics();
        this.eyeTracker = null;
        this.charts = {};
        this.initialize();
    }

    async initialize() {
        // Initialize eye tracker if available
        if (window.AdvancedEyeTracker) {
            this.eyeTracker = new AdvancedEyeTracker();
            await this.eyeTracker.initialize();
        }

        // Load test history and generate dashboard
        this.loadDashboard();
    }

    async loadDashboard() {
        // Get test history from localStorage or Supabase
        const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
        
        if (testHistory.length > 0) {
            // Analyze all results
            const insights = this.analytics.analyzeTestResults(testHistory[testHistory.length - 1]);
            this.renderDashboard(insights, testHistory);
        } else {
            this.renderEmptyDashboard();
        }
    }

    renderDashboard(insights, testHistory) {
        const dashboardContainer = document.getElementById('premium-dashboard');
        if (!dashboardContainer) return;

        const overallHealth = insights.overallHealth || { score: 0, level: 'No Data' };
        const trends = insights.trends || {};
        const recommendations = insights.recommendations || [];
        const riskFactors = insights.riskFactors || [];

        dashboardContainer.innerHTML = `
            <div class="premium-dashboard premium-fade-in">
                <h2>📊 Premium Analytics Dashboard</h2>
                
                <div class="premium-metrics">
                    <div class="premium-metric">
                        <div class="premium-metric-label">Overall Health</div>
                        <div class="premium-metric-value">${overallHealth.score}%</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">${overallHealth.level}</div>
                    </div>
                    
                    <div class="premium-metric">
                        <div class="premium-metric-label">Tests Completed</div>
                        <div class="premium-metric-value">${testHistory.length}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Total assessments</div>
                    </div>
                    
                    <div class="premium-metric">
                        <div class="premium-metric-label">Vision Trend</div>
                        <div class="premium-metric-value">${trends.visualAcuity?.direction === 'improving' ? '↑' : trends.visualAcuity?.direction === 'declining' ? '↓' : '→'}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">${trends.visualAcuity?.direction || 'Stable'}</div>
                    </div>
                    
                    <div class="premium-metric">
                        <div class="premium-metric-label">Last Test</div>
                        <div class="premium-metric-value">${this.formatDate(testHistory[testHistory.length - 1]?.test_date || testHistory[testHistory.length - 1]?.timestamp)}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Most recent</div>
                    </div>
                </div>

                ${this.renderTrendsChart(trends)}
                ${this.renderRecommendations(recommendations)}
                ${this.renderRiskFactors(riskFactors)}
            </div>
        `;

        // Render charts
        this.renderCharts(testHistory);
    }

    renderTrendsChart(trends) {
        if (!trends.visualAcuity) return '';

        return `
            <div class="premium-insights" style="margin-top: 2rem;">
                <div class="premium-insight-card">
                    <div class="premium-insight-icon">📈</div>
                    <div class="premium-insight-title">Visual Acuity Trend</div>
                    <div class="premium-insight-text">
                        ${trends.visualAcuity.direction === 'improving' ? 'Your vision is improving!' : 
                          trends.visualAcuity.direction === 'declining' ? 'Your vision shows decline. Consider professional consultation.' : 
                          'Your vision remains stable.'}
                        ${trends.visualAcuity.change ? `Change: ${trends.visualAcuity.change > 0 ? '+' : ''}${trends.visualAcuity.change}%` : ''}
                    </div>
                </div>
                
                ${trends.prescription ? `
                <div class="premium-insight-card">
                    <div class="premium-insight-icon">👓</div>
                    <div class="premium-insight-title">Prescription Changes</div>
                    <div class="premium-insight-text">
                        ${trends.prescription.sphereChange !== 0 ? `Sphere: ${trends.prescription.sphereChange > 0 ? '+' : ''}${trends.prescription.sphereChange.toFixed(2)}D` : 'No significant changes'}
                        ${trends.prescription.cylinderChange !== 0 ? `<br>Cylinder: ${trends.prescription.cylinderChange > 0 ? '+' : ''}${trends.prescription.cylinderChange.toFixed(2)}D` : ''}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderRecommendations(recommendations) {
        if (recommendations.length === 0) return '';

        return `
            <div class="premium-recommendations" style="margin-top: 2rem;">
                <h3>Professional Recommendations</h3>
                ${recommendations.map(rec => `
                    <div class="premium-recommendation-item">
                        <span class="premium-recommendation-priority ${rec.priority}">${rec.priority}</span>
                        <div>
                            <strong>${rec.type.replace('_', ' ').toUpperCase()}</strong>
                            <p style="margin: 0.5rem 0 0 0;">${rec.message}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRiskFactors(riskFactors) {
        if (riskFactors.length === 0) return '';

        return `
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 68, 68, 0.1); border-radius: 12px; border-left: 4px solid #ff4444;">
                <h3 style="color: #ff4444; margin-bottom: 1rem;">⚠️ Risk Factors Identified</h3>
                ${riskFactors.map(risk => `
                    <div style="padding: 1rem; margin: 0.5rem 0; background: white; border-radius: 8px;">
                        <strong>${risk.type.replace('_', ' ').toUpperCase()}</strong> - ${risk.severity.toUpperCase()} Priority
                        <p style="margin: 0.5rem 0 0 0;">${risk.message}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCharts(testHistory) {
        // Visual Acuity Trend Chart
        if (testHistory.length > 1 && typeof Chart !== 'undefined') {
            const acuityData = testHistory
                .filter(t => t.test_type === 'visual-acuity')
                .map(t => ({
                    x: new Date(t.test_date || t.timestamp),
                    y: t.decimal_acuity || t.score || 0
                }));

            if (acuityData.length > 0) {
                const ctx = document.createElement('canvas');
                ctx.id = 'acuity-trend-chart';
                document.querySelector('.premium-dashboard')?.appendChild(ctx);

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Visual Acuity',
                            data: acuityData,
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'day'
                                }
                            },
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: 'Visual Acuity (Decimal)'
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    renderEmptyDashboard() {
        const dashboardContainer = document.getElementById('premium-dashboard');
        if (!dashboardContainer) return;

        dashboardContainer.innerHTML = `
            <div class="premium-dashboard">
                <h2>Screening insights</h2>
                <p style="text-align: center; padding: 2rem 1rem 0.5rem; opacity: 0.8;">
                    Complete your first screening test to see analytics here.
                </p>
                <p style="text-align: center; padding: 0 1rem 1.5rem; font-size: 0.9rem; opacity: 0.7;">
                    Results are a screening, not a diagnosis or a dispensable prescription.
                </p>
                <p style="text-align: center; padding-bottom: 2rem;">
                    <a href="#tests" class="btn btn-gradient">Start a screening test</a>
                </p>
            </div>
        `;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    async updateRealTimeMetrics(videoElement) {
        if (!this.eyeTracker || !videoElement) return;

        const metrics = await this.eyeTracker.trackEyes(videoElement);
        if (metrics) {
            this.updateEyeTrackingDisplay(metrics);
        }
    }

    updateEyeTrackingDisplay(metrics) {
        const display = document.getElementById('eye-tracking-display');
        if (!display) return;

        display.innerHTML = `
            <div class="premium-eye-tracking">
                <h3 style="margin-bottom: 1rem;">👁️ Real-Time Eye Tracking</h3>
                <div class="premium-eye-metrics">
                    <div class="premium-eye-metric">
                        <div class="premium-eye-metric-label">Pupil Size (L)</div>
                        <div class="premium-eye-metric-value">${metrics.pupilSize.left.toFixed(2)}</div>
                    </div>
                    <div class="premium-eye-metric">
                        <div class="premium-eye-metric-label">Pupil Size (R)</div>
                        <div class="premium-eye-metric-value">${metrics.pupilSize.right.toFixed(2)}</div>
                    </div>
                    <div class="premium-eye-metric">
                        <div class="premium-eye-metric-label">Fixation Stability</div>
                        <div class="premium-eye-metric-value">${metrics.fixationStability.toFixed(1)}%</div>
                    </div>
                    <div class="premium-eye-metric">
                        <div class="premium-eye-metric-label">Eye Alignment</div>
                        <div class="premium-eye-metric-value">${metrics.eyeAlignment.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize dashboard when DOM is ready
if (typeof window !== 'undefined') {
    window.PremiumDashboard = PremiumDashboard;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('premium-dashboard')) {
            window.premiumDashboard = new PremiumDashboard();
        }
    });
}

