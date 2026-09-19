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
        
        // Compute change alerts (acuity, hearing, vision scan)
        const changeAlerts = this.detectMeaningfulChanges(testHistory);

        dashboardContainer.innerHTML = `
            <div class="premium-dashboard premium-fade-in">
                <h2>📊 Wellness Screening Profile & Trends</h2>
                
                ${changeAlerts.length > 0 ? `
                <div style="margin-bottom: 2rem; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
                    <div style="font-weight: 600; color: #92400E; margin-bottom: 0.75rem;">📊 Screening Changes Detected</div>
                    <div style="font-size: 0.85rem; color: #78350F; margin-bottom: 1rem;">Comparison with prior screening — not a diagnosis</div>
                    ${changeAlerts.map(alert => `
                        <div style="padding: 0.75rem; margin-bottom: 0.5rem; background: white; border-radius: 6px; border-left: 3px solid ${alert.improved ? '#10B981' : '#F59E0B'};">
                            <div style="font-weight: 600; color: ${alert.improved ? '#065F46' : '#92400E'}; margin-bottom: 0.25rem;">
                                ${alert.improved ? '✓ Improvement Detected' : '⚠️ Change Detected'}
                            </div>
                            <div style="font-size: 0.9rem; color: ${alert.improved ? '#047857' : '#B45309'};">
                                ${alert.message}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
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
    
    detectMeaningfulChanges(testHistory) {
        if (testHistory.length < 2) return [];
        
        const alerts = [];
        
        // Helper: convert Snellen to logMAR
        const snellenToLogMAR = (snellen) => {
            if (!snellen || typeof snellen !== 'string') return null;
            const parts = snellen.split('/');
            if (parts.length !== 2) return null;
            const num = parseFloat(parts[0]);
            const denom = parseFloat(parts[1]);
            if (!num || !denom) return null;
            return Math.log10(denom / num);
        };
        
        // Acuity changes (≥0.1 logMAR)
        const acuityTests = testHistory.filter(t => 
            t.test_type === 'visual-acuity' || 
            t.test_type === 'Visual Acuity' || 
            t.test_type === 'Visual Acuity (Clinical)'
        ).sort((a, b) => new Date(a.created_at || a.test_date || a.timestamp).getTime() - new Date(b.created_at || b.test_date || b.timestamp).getTime());
        
        if (acuityTests.length >= 2) {
            const latest = acuityTests[acuityTests.length - 1];
            const previous = acuityTests[acuityTests.length - 2];
            
            ['left', 'right'].forEach(eye => {
                const latestSnellen = latest.results?.[eye === 'left' ? 'leftEye' : 'rightEye']?.snellen || 
                                     latest.test_data?.[eye === 'left' ? 'leftEye' : 'rightEye']?.finalSnellen;
                const previousSnellen = previous.results?.[eye === 'left' ? 'leftEye' : 'rightEye']?.snellen || 
                                       previous.test_data?.[eye === 'left' ? 'leftEye' : 'rightEye']?.finalSnellen;
                
                if (latestSnellen && previousSnellen) {
                    const latestLogMAR = snellenToLogMAR(latestSnellen);
                    const previousLogMAR = snellenToLogMAR(previousSnellen);
                    
                    if (latestLogMAR !== null && previousLogMAR !== null) {
                        const change = latestLogMAR - previousLogMAR;
                        if (Math.abs(change) >= 0.1) {
                            const improved = change < 0;
                            alerts.push({
                                improved,
                                message: `<strong>${eye === 'left' ? 'Left eye (OS)' : 'Right eye (OD)'}:</strong> ${improved ? 'Improved' : 'Declined'} by ${Math.abs(change).toFixed(2)} logMAR (${latestSnellen} from ${previousSnellen}). ${improved ? '' : 'Consider a professional eye exam.'} Screening only — not a diagnosis.`
                            });
                        }
                    }
                }
            });
        }
        
        // Hearing screening changes
        const hearingTests = testHistory.filter(t => 
            t.test_type === 'hearing-screening' || 
            t.test_type === 'Hearing Screening' ||
            t.test_name === 'Hearing Screening'
        ).sort((a, b) => new Date(a.created_at || a.test_date || a.timestamp).getTime() - new Date(b.created_at || b.test_date || b.timestamp).getTime());
        
        if (hearingTests.length >= 2) {
            const latest = hearingTests[hearingTests.length - 1];
            const previous = hearingTests[hearingTests.length - 2];
            
            const latestLeft = latest.test_data?.leftEarPassCount || latest.results?.leftEarPassCount || 0;
            const latestRight = latest.test_data?.rightEarPassCount || latest.results?.rightEarPassCount || 0;
            const prevLeft = previous.test_data?.leftEarPassCount || previous.results?.leftEarPassCount || 0;
            const prevRight = previous.test_data?.rightEarPassCount || previous.results?.rightEarPassCount || 0;
            const totalFreq = latest.test_data?.totalFrequencies || latest.results?.totalFrequencies || 4;
            
            if (latestLeft !== prevLeft) {
                const change = latestLeft - prevLeft;
                const improved = change > 0;
                alerts.push({
                    improved,
                    message: `<strong>Hearing screening (L ear):</strong> ${improved ? 'Improved' : 'Declined'} by ${Math.abs(change)} frequency${Math.abs(change) !== 1 ? 'ies' : ''} (${latestLeft}/${totalFreq} from ${prevLeft}/${totalFreq}). ${improved ? '' : 'Consider a hearing evaluation.'} Screening only — not calibrated dB HL.`
                });
            }
            
            if (latestRight !== prevRight) {
                const change = latestRight - prevRight;
                const improved = change > 0;
                alerts.push({
                    improved,
                    message: `<strong>Hearing screening (R ear):</strong> ${improved ? 'Improved' : 'Declined'} by ${Math.abs(change)} frequency${Math.abs(change) !== 1 ? 'ies' : ''} (${latestRight}/${totalFreq} from ${prevRight}/${totalFreq}). ${improved ? '' : 'Consider a hearing evaluation.'} Screening only — not calibrated dB HL.`
                });
            }
        }
        
        // Vision Scan changes (alignment index ≥5 or recommendation flip)
        const visionScanTests = testHistory.filter(t => 
            t.test_type === 'vision-scan' || 
            t.test_type === 'Vision Scan'
        ).sort((a, b) => new Date(a.created_at || a.test_date || a.timestamp).getTime() - new Date(b.created_at || b.test_date || b.timestamp).getTime());
        
        if (visionScanTests.length >= 2) {
            const latest = visionScanTests[visionScanTests.length - 1];
            const previous = visionScanTests[visionScanTests.length - 2];
            
            const latestAlign = latest.test_data?.alignment?.alignmentIndex;
            const prevAlign = previous.test_data?.alignment?.alignmentIndex;
            
            if (latestAlign !== undefined && prevAlign !== undefined) {
                const change = latestAlign - prevAlign;
                if (Math.abs(change) >= 5) {
                    const improved = change > 0;
                    alerts.push({
                        improved,
                        message: `<strong>Vision Scan (mobile camera):</strong> Alignment index ${improved ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(0)} points (${latestAlign.toFixed(0)} from ${prevAlign.toFixed(0)}). ${improved ? '' : 'Consider a comprehensive eye exam.'} Screening only — not a clinical assessment.`
                    });
                }
            }
            
            const latestRecommend = latest.test_data?.recommendsProfessionalExam;
            const prevRecommend = previous.test_data?.recommendsProfessionalExam;
            if (latestRecommend !== undefined && prevRecommend !== undefined && latestRecommend !== prevRecommend) {
                alerts.push({
                    improved: !latestRecommend,
                    message: `<strong>Vision Scan (mobile camera):</strong> ${latestRecommend ? 'Now recommends professional exam' : 'No longer recommends professional exam'}. Screening only — not a clinical assessment.`
                });
            }
        }
        
        return alerts;
    }

    renderTrendsChart(trends) {
        if (!trends.visualAcuity && !trends.hearing) return '';

        return `
            <div class="premium-insights" style="margin-top: 2rem;">
                ${trends.visualAcuity ? `
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
                ` : ''}
                
                ${trends.hearing ? `
                <div class="premium-insight-card">
                    <div class="premium-insight-icon">🎧</div>
                    <div class="premium-insight-title">Hearing Screening Trend</div>
                    <div class="premium-insight-text">
                        ${trends.hearing.overallStatus || 'See details'}
                        ${trends.hearing.leftChange || trends.hearing.rightChange ? `<br><small style="opacity: 0.8;">Wellness screening only — NOT calibrated dB HL</small>` : ''}
                    </div>
                </div>
                ` : ''}
                
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

