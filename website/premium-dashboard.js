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
        // Initialize classroom screening if available
        if (window.ClassroomScreening) {
            await window.ClassroomScreening.initialize();
        }

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
                ${this.renderClassroomScreeningUI()}
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
                ${this.renderClassroomScreeningUI()}
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

    // ============================================
    // CLASSROOM SCREENING UI
    // ============================================

    renderClassroomScreeningUI() {
        if (!window.ClassroomScreening) return '';

        const cs = window.ClassroomScreening;
        
        // Check if there's an active session
        if (cs.hasActiveSession()) {
            return this.renderActiveSession(cs);
        }
        
        // Check if there are enough students to show the feature
        if (cs.hasEnoughStudents()) {
            return this.renderClassroomPrompt(cs);
        }
        
        return '';
    }

    renderClassroomPrompt(cs) {
        const students = cs.getStudents();
        
        return `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.3rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>👩‍🏫</span>
                            <span>Classroom Screening</span>
                        </h3>
                        <p style="margin: 0; opacity: 0.95; font-size: 0.95rem;">
                            Run efficient vision screening for ${students.length} student${students.length !== 1 ? 's' : ''} one-by-one
                        </p>
                    </div>
                    <button onclick="startClassroomScreening()" class="btn" style="background: white; color: #667eea; font-weight: 600; padding: 0.875rem 1.75rem; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.3s;">
                        🎓 Start Class Screening
                    </button>
                </div>
            </div>
        `;
    }

    renderActiveSession(cs) {
        const student = cs.getCurrentStudent();
        if (!student) return '';
        
        const progress = cs.getProgress();
        const testStatus = cs.getTestCompletionStatus(student.id);
        const missingTests = cs.getMissingTests(student.id);
        const completionPct = cs.getCompletionPercentage(student.id);
        
        return `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.1rem;">👩‍🏫</span>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Classroom Screening Session</span>
                        </div>
                        <h3 style="margin: 0; font-size: 1.5rem;">
                            ${student.display_name}
                        </h3>
                        <div style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.9;">
                            Student ${progress.current} of ${progress.total} • ${completionPct}% complete
                        </div>
                    </div>
                    <button onclick="endClassroomScreening()" class="btn" style="background: rgba(255,255,255,0.2); color: white; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; font-size: 0.9rem;">
                        End Session
                    </button>
                </div>

                <!-- Progress Bar -->
                <div style="margin-bottom: 1.5rem;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 999px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #a8ff78, #78ffd6); height: 100%; width: ${completionPct}%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- Test Status Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
                    ${cs.coreTests.map(test => `
                        <div style="background: rgba(255,255,255,${testStatus[test.type] ? '0.25' : '0.1'}); padding: 0.75rem; border-radius: 8px; text-align: center; border: 2px solid ${testStatus[test.type] ? '#a8ff78' : 'rgba(255,255,255,0.2)'};">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${testStatus[test.type] ? '✅' : test.icon}</div>
                            <div style="font-size: 0.8rem; font-weight: ${testStatus[test.type] ? '600' : '400'};">
                                ${test.name}
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${missingTests.length > 0 ? `
                    <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            📋 Missing Tests (${missingTests.length})
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${missingTests.map(test => `
                                <a href="#tests" onclick="handleTestLink('${test.type}')" style="background: white; color: #667eea; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem; transition: all 0.2s;">
                                    ${test.icon} ${test.name}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(168, 255, 120, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🎉</div>
                        <div style="font-weight: 600;">All core tests completed!</div>
                    </div>
                `}

                <!-- Navigation -->
                <div style="display: flex; gap: 0.75rem; justify-content: center;">
                    ${progress.current > 1 ? `
                        <button onclick="previousStudent()" class="btn" style="background: rgba(255,255,255,0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; font-weight: 600;">
                            ← Previous
                        </button>
                    ` : ''}
                    <button onclick="skipStudent()" class="btn" style="background: rgba(255,255,255,0.2); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; font-weight: 600;">
                        Skip Student
                    </button>
                    <button onclick="markCompleteAndNext()" class="btn" style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                        ${missingTests.length === 0 ? '✓ Complete' : 'Mark Complete'} & Next →
                    </button>
                </div>
            </div>
        `;
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

// ============================================
// CLASSROOM SCREENING INTERACTION FUNCTIONS
// ============================================

async function startClassroomScreening() {
    if (!window.ClassroomScreening) {
        console.error('ClassroomScreening not available');
        return;
    }
    
    const started = window.ClassroomScreening.startSession();
    if (started) {
        // Reload dashboard to show active session
        if (window.premiumDashboard) {
            await window.premiumDashboard.loadDashboard();
        }
    } else {
        alert('Unable to start classroom screening session. Please ensure you have students added.');
    }
}

async function endClassroomScreening() {
    if (!window.ClassroomScreening) return;
    
    const confirmed = confirm('Are you sure you want to end the classroom screening session?');
    if (confirmed) {
        window.ClassroomScreening.endSession();
        
        // Reload dashboard
        if (window.premiumDashboard) {
            await window.premiumDashboard.loadDashboard();
        }
    }
}

async function nextStudent() {
    if (!window.ClassroomScreening) return;
    
    const hasNext = window.ClassroomScreening.nextStudent();
    
    // Reload dashboard to show next student
    if (window.premiumDashboard) {
        await window.premiumDashboard.loadDashboard();
    }
    
    if (!hasNext) {
        // Session ended
        alert('Classroom screening session completed! 🎉');
    }
}

async function previousStudent() {
    if (!window.ClassroomScreening) return;
    
    window.ClassroomScreening.previousStudent();
    
    // Reload dashboard
    if (window.premiumDashboard) {
        await window.premiumDashboard.loadDashboard();
    }
}

async function skipStudent() {
    if (!window.ClassroomScreening) return;
    
    window.ClassroomScreening.markSkipped();
    await nextStudent();
}

async function markCompleteAndNext() {
    if (!window.ClassroomScreening) return;
    
    window.ClassroomScreening.markComplete();
    await nextStudent();
}

function handleTestLink(testType) {
    // Store the active participant in a way tests can access it
    if (window.ClassroomScreening && window.ClassroomScreening.hasActiveSession()) {
        const student = window.ClassroomScreening.getCurrentStudent();
        if (student) {
            localStorage.setItem('spectit_active_participant_for_test', JSON.stringify(student));
        }
    }
    
    // Scroll to tests section
    setTimeout(() => {
        const testsSection = document.getElementById('tests');
        if (testsSection) {
            testsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Export functions
if (typeof window !== 'undefined') {
    window.startClassroomScreening = startClassroomScreening;
    window.endClassroomScreening = endClassroomScreening;
    window.nextStudent = nextStudent;
    window.previousStudent = previousStudent;
    window.skipStudent = skipStudent;
    window.markCompleteAndNext = markCompleteAndNext;
    window.handleTestLink = handleTestLink;
}

