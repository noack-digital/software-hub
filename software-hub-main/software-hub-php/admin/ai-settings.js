// AI Settings JavaScript

// Toggle API key visibility
document.getElementById('toggleKeyVisibility').addEventListener('click', function() {
    const keyInput = document.getElementById('geminiApiKey');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (keyInput.type === 'password') {
        keyInput.type = 'text';
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        keyInput.type = 'password';
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
});

// Test API key
document.getElementById('testApiKey').addEventListener('click', async function() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    const statusDiv = document.getElementById('apiKeyStatus');
    const testBtn = this;
    
    if (!apiKey) {
        showStatus('Bitte geben Sie einen API-Schlüssel ein.', 'error');
        return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = 'Teste...';
    statusDiv.style.display = 'block';
    statusDiv.className = '';
    statusDiv.textContent = 'Teste API-Schlüssel...';
    statusDiv.style.background = '#e7f3ff';
    statusDiv.style.color = '#004085';
    
    try {
        const response = await fetch('/api/ai/test-key.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: apiKey })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('✓ API-Schlüssel ist gültig!', 'success');
        } else {
            showStatus('✗ ' + (result.error || 'API-Schlüssel ungültig'), 'error');
        }
    } catch (error) {
        showStatus('✗ Fehler beim Testen: ' + error.message, 'error');
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = 'API-Key testen';
    }
});

// Save settings
document.getElementById('aiSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        GOOGLE_GEMINI_API_KEY: document.getElementById('geminiApiKey').value.trim(),
        AI_DESCRIPTION_WORDS: document.getElementById('aiDescriptionWords').value,
        AI_SHORT_DESCRIPTION_WORDS: document.getElementById('aiShortDescriptionWords').value,
        AI_ALTERNATIVES_COUNT: document.getElementById('aiAlternativesCount').value
    };
    
    try {
        const response = await fetch('/api/settings.php', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success || response.ok) {
            showAlert('Einstellungen erfolgreich gespeichert', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            throw new Error(result.error || 'Fehler beim Speichern');
        }
    } catch (error) {
        showAlert('Fehler: ' + error.message, 'error');
    }
});

// Helper functions
function showStatus(message, type) {
    const statusDiv = document.getElementById('apiKeyStatus');
    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    if (type === 'success') {
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.style.borderLeft = '4px solid #28a745';
    } else if (type === 'error') {
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.color = '#721c24';
        statusDiv.style.borderLeft = '4px solid #dc3545';
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '1rem';
    alertDiv.style.right = '1rem';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.padding = '1rem';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    alertDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}
