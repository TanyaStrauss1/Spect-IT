// Database Service Layer
// Handles all CRUD operations for test results and prescriptions

const DatabaseService = {
    // ============================================
    // TEST RESULTS
    // ============================================
    
    // Save test result
    async saveTestResult(testType, testData, results) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            // Fallback to local storage
            return this.saveToLocalStorage('test_result', { testType, testData, results });
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated to save test results');
        }

        const { data, error } = await client
            .from('test_results')
            .insert({
                user_id: user.id,
                test_type: testType,
                test_data: testData,
                results: results
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all test results for current user
    async getTestResults(testType = null) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            // Fallback to local storage
            return this.getFromLocalStorage('test_results', testType);
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            return [];
        }

        let query = client
            .from('test_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (testType) {
            query = query.eq('test_type', testType);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get single test result
    async getTestResult(resultId) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return null;
        }

        const { data, error } = await client
            .from('test_results')
            .select('*')
            .eq('id', resultId)
            .single();

        if (error) throw error;
        return data;
    },

    // Delete test result
    async deleteTestResult(resultId) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return this.deleteFromLocalStorage('test_result', resultId);
        }

        const { error } = await client
            .from('test_results')
            .delete()
            .eq('id', resultId);

        if (error) throw error;
    },

    // ============================================
    // PRESCRIPTIONS
    // ============================================

    // Save prescription
    async savePrescription(prescriptionData, measurementMethod = 'camera', accuracyScore = null, notes = '') {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return this.saveToLocalStorage('prescription', { prescriptionData, measurementMethod, accuracyScore, notes });
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated to save prescriptions');
        }

        const { data, error } = await client
            .from('prescriptions')
            .insert({
                user_id: user.id,
                prescription_data: prescriptionData,
                measurement_method: measurementMethod,
                accuracy_score: accuracyScore,
                notes: notes
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all prescriptions for current user
    async getPrescriptions() {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return this.getFromLocalStorage('prescriptions');
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            return [];
        }

        const { data, error } = await client
            .from('prescriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get single prescription
    async getPrescription(prescriptionId) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return null;
        }

        const { data, error } = await client
            .from('prescriptions')
            .select('*')
            .eq('id', prescriptionId)
            .single();

        if (error) throw error;
        return data;
    },

    // Delete prescription
    async deletePrescription(prescriptionId) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return this.deleteFromLocalStorage('prescription', prescriptionId);
        }

        const { error } = await client
            .from('prescriptions')
            .delete()
            .eq('id', prescriptionId);

        if (error) throw error;
    },

    // ============================================
    // SHARING
    // ============================================

    // Share test result or prescription
    async shareResult(resultId, prescriptionId, expiresInDays = 30) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            throw new Error('Sharing requires Supabase');
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated');
        }

        // Generate unique share token
        const shareToken = this.generateShareToken();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const { data, error } = await client
            .from('shared_results')
            .insert({
                test_result_id: resultId,
                prescription_id: prescriptionId,
                share_token: shareToken,
                shared_by: user.id,
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, shareUrl: `${window.location.origin}/share/${shareToken}` };
    },

    // Get shared result by token
    async getSharedResult(shareToken) {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            throw new Error('Sharing requires Supabase');
        }

        const { data, error } = await client
            .from('shared_results')
            .select(`
                *,
                test_results (*),
                prescriptions (*)
            `)
            .eq('share_token', shareToken)
            .single();

        if (error) throw error;

        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            throw new Error('This shared link has expired');
        }

        return data;
    },

    // ============================================
    // STATISTICS
    // ============================================

    // Get user test statistics
    async getTestStatistics() {
        const client = window.SupabaseClient.getClient();
        if (!client) {
            return this.getLocalStatistics();
        }

        const user = await window.SupabaseClient.getCurrentUser();
        if (!user) {
            return null;
        }

        const { data, error } = await client
            .from('user_test_summary')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data || [];
    },

    // ============================================
    // LOCAL STORAGE FALLBACK
    // ============================================

    saveToLocalStorage(type, data) {
        const key = `spectit_${type}_${Date.now()}`;
        const stored = {
            id: key,
            ...data,
            created_at: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(stored));
        return stored;
    },

    getFromLocalStorage(type, filter = null) {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`spectit_${type}_`)) {
                const item = JSON.parse(localStorage.getItem(key));
                if (!filter || item.testType === filter) {
                    items.push(item);
                }
            }
        }
        return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    deleteFromLocalStorage(type, id) {
        localStorage.removeItem(id);
    },

    getLocalStatistics() {
        const results = this.getFromLocalStorage('test_result');
        const stats = {};
        results.forEach(result => {
            if (!stats[result.testType]) {
                stats[result.testType] = { count: 0, lastTest: null };
            }
            stats[result.testType].count++;
            const testDate = new Date(result.created_at);
            if (!stats[result.testType].lastTest || testDate > new Date(stats[result.testType].lastTest)) {
                stats[result.testType].lastTest = result.created_at;
            }
        });
        return Object.keys(stats).map(testType => ({
            test_type: testType,
            test_count: stats[testType].count,
            last_test_date: stats[testType].lastTest
        }));
    },

    generateShareToken() {
        return 'share_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
    }
};

// Export for use in other files
window.DatabaseService = DatabaseService;

