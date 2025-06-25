# OAuth Flow Design for AlgoTraders

## Recommended Hybrid Approach

### Flow Overview
```
1. User clicks "Sign in with Google" on algotraders.dev
2. Frontend redirects to Google OAuth with state parameter
3. Google redirects back to frontend (algotraders.dev/oauth-callback)
4. Frontend extracts access_token from URL fragment
5. Frontend sends access_token to callback server (api.algotraders.dev/api/auth/callback)
6. Callback server verifies token and returns user data + JWT
7. Frontend stores JWT and redirects to dashboard
```

### Implementation Details

#### Frontend OAuth Handler (algotraders.dev/oauth-callback)
```javascript
// Extract token from URL fragment
const urlParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = urlParams.get('access_token');
const state = urlParams.get('state');

// Verify state parameter (security)
if (state !== localStorage.getItem('oauth_state')) {
  // Handle state mismatch
  window.location.href = '/login?error=invalid_state';
  return;
}

// Send to callback server
try {
  const response = await fetch('https://api.algotraders.dev/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, state })
  });
  
  if (response.ok) {
    const userData = await response.json();
    // Store JWT token
    localStorage.setItem('auth_token', userData.session_token);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    // Handle error
    window.location.href = '/login?error=auth_failed';
  }
} catch (error) {
  window.location.href = '/login?error=network_error';
}
```

#### Google OAuth Configuration
```
Authorized redirect URIs:
- https://algotraders.dev/oauth-callback (production)
- http://localhost:5173/oauth-callback (development)
```

### Security Benefits

1. **State Parameter Validation** - Prevents CSRF attacks
2. **Token Verification** - Server validates Google token
3. **JWT Session Management** - Secure session tokens
4. **Error Handling** - Graceful failure recovery

### Performance Benefits

1. **Minimal Redirects** - User stays on frontend domain
2. **Fast Token Exchange** - Direct API call to callback server
3. **Caching** - Frontend can cache user data
4. **Progressive Enhancement** - Works with JavaScript disabled

### Error Handling

#### Frontend Error States
- `/login?error=invalid_state` - OAuth state mismatch
- `/login?error=auth_failed` - Token verification failed
- `/login?error=network_error` - Network connectivity issues
- `/login?error=server_error` - Callback server unavailable

#### Callback Server Error Responses
```json
{
  "error": "invalid_token",
  "message": "Access token is invalid or expired",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Alternative: Direct to Callback Server

If you prefer the direct approach:

#### Google OAuth Configuration
```
Authorized redirect URIs:
- https://api.algotraders.dev/oauth/callback (production)
- http://localhost:3000/oauth/callback (development)
```

#### Callback Server Endpoint
```python
@app.get("/oauth/callback")
async def oauth_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    if error:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"https://algotraders.dev/login?error={error}"
        )
    
    # Exchange code for access token
    access_token = await exchange_code_for_token(code)
    
    # Verify token and get user info
    user_info = await verify_google_token(access_token)
    
    # Create session
    session_token = create_jwt_token(user_info)
    
    # Redirect to frontend with session
    return RedirectResponse(
        url=f"https://algotraders.dev/dashboard?token={session_token}"
    )
```

### Recommendation

**Use the Hybrid Approach** because:

1. **Better User Experience** - Users stay on your domain
2. **Easier Error Handling** - Frontend can show proper error pages
3. **Better Security** - State parameter validation
4. **Simpler Development** - Frontend handles UI, backend handles auth
5. **More Flexible** - Can easily add loading states, retry logic, etc.

The slight performance overhead of the extra network hop is worth the improved user experience and security. 