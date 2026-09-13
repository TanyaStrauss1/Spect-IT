/**
 * CLASSROOM SCREENING SESSION WORKFLOW
 * Enables teachers to efficiently screen multiple students one-by-one
 */

class ClassroomScreeningSession {
    constructor() {
        this.session = null;
        this.participants = [];
        this.testResults = [];
        this.currentUserEmail = null;
        
        // Core tests to track
        this.coreTests = [
            { type: 'visual-acuity', name: 'Visual Acuity', icon: '📏' },
            { type: 'contrast', name: 'Contrast', icon: '🌓' },
            { type: 'color-blindness', name: 'Color Vision', icon: '🎨' },
            { type: 'astigmatism', name: 'Astigmatism', icon: '⚫' },
            { type: 'visual-field', name: 'Visual Field', icon: '👁️' },
            { type: 'prescription', name: 'Prescription', icon: '🔍' }
        ];
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================

    async initialize() {
        // Get current user email
        this.currentUserEmail = localStorage.getItem('spectit_user_email');
        if (!this.currentUserEmail) {
            console.warn('[ClassroomScreening] No user email found');
            return false;
        }

        // Load participants from Supabase
        await this.loadParticipants();

        // Load existing session if any
        this.loadSession();

        // Load test results
        await this.loadTestResults();

        return true;
    }

    async loadParticipants() {
        const client = window.SupabaseStorage?.getClient();
        if (!client) {
            console.warn('[ClassroomScreening] Supabase not available');
            this.participants = [];
            return;
        }

        try {
            // Get authenticated user
            const { data: { user }, error: authError } = await client.auth.getUser();
            if (authError || !user) {
                console.warn('[ClassroomScreening] User not authenticated');
                this.participants = [];
                return;
            }

            // Fetch all non-archived participants
            const { data, error } = await client
                .from('participants')
                .select('*')
                .eq('user_id', user.id)
                .eq('archived', false)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('[ClassroomScreening] Error loading participants:', error);
                this.participants = [];
                return;
            }

            this.participants = data || [];
            console.log(`[ClassroomScreening] Loaded ${this.participants.length} participants`);
        } catch (error) {
            console.error('[ClassroomScreening] Error in loadParticipants:', error);
            this.participants = [];
        }
    }

    async loadTestResults() {
        const client = window.SupabaseStorage?.getClient();
        if (!client) {
            // Fallback to localStorage
            this.testResults = JSON.parse(localStorage.getItem('testHistory') || '[]');
            return;
        }

        try {
            const { data: { user }, error: authError } = await client.auth.getUser();
            if (authError || !user) {
                this.testResults = JSON.parse(localStorage.getItem('testHistory') || '[]');
                return;
            }

            // Fetch all test results for this user
            const { data, error } = await client
                .from('test_results')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ClassroomScreening] Error loading test results:', error);
                this.testResults = [];
                return;
            }

            // Extract result_data from results (Supabase stores full result in result_data column)
            this.testResults = (data || []).map(r => {
                const result = r.result_data || r;
                // Ensure participant_id is present
                if (!result.participant_id && r.participant_id) {
                    result.participant_id = r.participant_id;
                }
                // Ensure type is present
                if (!result.type && r.test_type) {
                    result.type = r.test_type;
                }
                return result;
            });
            console.log(`[ClassroomScreening] Loaded ${this.testResults.length} test results`);
        } catch (error) {
            console.error('[ClassroomScreening] Error in loadTestResults:', error);
            this.testResults = [];
        }
    }

    getStudents() {
        return this.participants.filter(p => p.role === 'student');
    }

    hasEnoughStudents() {
        return this.getStudents().length >= 2;
    }

    // ============================================
    // SESSION STATE
    // ============================================

    startSession(students = null) {
        const studentsToScreen = students || this.getStudents();
        
        if (studentsToScreen.length === 0) {
            console.warn('[ClassroomScreening] No students to screen');
            return false;
        }

        this.session = {
            id: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
            currentIndex: 0,
            students: studentsToScreen.map(s => s.id),
            completedStudents: [],
            skippedStudents: [],
            active: true
        };

        this.saveSession();
        console.log('[ClassroomScreening] Session started:', this.session);
        return true;
    }

    loadSession() {
        const key = this.getSessionStorageKey();
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                this.session = JSON.parse(saved);
                console.log('[ClassroomScreening] Session loaded:', this.session);
            } catch (error) {
                console.error('[ClassroomScreening] Error parsing session:', error);
                this.session = null;
            }
        }
    }

    saveSession() {
        if (!this.session) return;
        
        const key = this.getSessionStorageKey();
        localStorage.setItem(key, JSON.stringify(this.session));
    }

    getSessionStorageKey() {
        // Account-scoped key
        return `spectit_classroom_session_${this.currentUserEmail}`;
    }

    endSession() {
        if (this.session) {
            this.session.active = false;
            this.session.endedAt = new Date().toISOString();
            this.saveSession();
        }
        this.session = null;
        
        // Clear from localStorage
        const key = this.getSessionStorageKey();
        localStorage.removeItem(key);
        
        console.log('[ClassroomScreening] Session ended');
    }

    hasActiveSession() {
        return this.session && this.session.active;
    }

    // ============================================
    // NAVIGATION
    // ============================================

    getCurrentStudent() {
        if (!this.hasActiveSession()) return null;
        
        const studentId = this.session.students[this.session.currentIndex];
        return this.participants.find(p => p.id === studentId);
    }

    getProgress() {
        if (!this.hasActiveSession()) return { current: 0, total: 0 };
        
        return {
            current: this.session.currentIndex + 1,
            total: this.session.students.length,
            completed: this.session.completedStudents.length,
            skipped: this.session.skippedStudents.length
        };
    }

    nextStudent() {
        if (!this.hasActiveSession()) return false;
        
        if (this.session.currentIndex < this.session.students.length - 1) {
            this.session.currentIndex++;
            this.saveSession();
            return true;
        }
        
        // End of session
        this.endSession();
        return false;
    }

    previousStudent() {
        if (!this.hasActiveSession()) return false;
        
        if (this.session.currentIndex > 0) {
            this.session.currentIndex--;
            this.saveSession();
            return true;
        }
        
        return false;
    }

    markComplete() {
        if (!this.hasActiveSession()) return;
        
        const studentId = this.session.students[this.session.currentIndex];
        if (!this.session.completedStudents.includes(studentId)) {
            this.session.completedStudents.push(studentId);
            this.saveSession();
        }
    }

    markSkipped() {
        if (!this.hasActiveSession()) return;
        
        const studentId = this.session.students[this.session.currentIndex];
        if (!this.session.skippedStudents.includes(studentId)) {
            this.session.skippedStudents.push(studentId);
            this.saveSession();
        }
    }

    // ============================================
    // TEST STATUS
    // ============================================

    getTestCompletionStatus(participantId) {
        const status = {};
        
        this.coreTests.forEach(test => {
            const hasTest = this.testResults.some(r => 
                r.participant_id === participantId && 
                r.type === test.type
            );
            status[test.type] = hasTest;
        });
        
        return status;
    }

    getMissingTests(participantId) {
        const status = this.getTestCompletionStatus(participantId);
        return this.coreTests.filter(test => !status[test.type]);
    }

    getCompletionPercentage(participantId) {
        const status = this.getTestCompletionStatus(participantId);
        const completed = Object.values(status).filter(Boolean).length;
        return Math.round((completed / this.coreTests.length) * 100);
    }

    // ============================================
    // DEEP LINKS
    // ============================================

    getTestUrl(testType) {
        const testUrls = {
            'visual-acuity': '#tests',
            'contrast': '#tests',
            'color-blindness': '#tests',
            'astigmatism': '#tests',
            'visual-field': '#tests',
            'prescription': '#tests'
        };
        
        return testUrls[testType] || '#tests';
    }

    // ============================================
    // UTILITY
    // ============================================

    getSessionSummary() {
        if (!this.hasActiveSession()) return null;
        
        const progress = this.getProgress();
        const current = this.getCurrentStudent();
        
        return {
            id: this.session.id,
            startedAt: this.session.startedAt,
            progress: progress,
            currentStudent: current,
            active: this.session.active
        };
    }

    async refresh() {
        // Reload participants and test results
        await this.loadParticipants();
        await this.loadTestResults();
    }
}

// Export singleton instance
window.ClassroomScreening = new ClassroomScreeningSession();
