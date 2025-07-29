Password Forgot flow
* Account status check
* Email verification
* previous password check
* password reset token check
* password reset
* password reset token revoke
* update user
* revoke all sessions to force login
1) http://localhost:8080/api/auth/password/forgot
send request to this endpoint and get the reset password token(expires in 20 mins)
2) http://localhost:8080/api/auth/password/reset
send request to this endpoint with the token and new password


Login Flow
* Account status check
* Email verification
* password check
* update user (last login date and login ip)
1) http://localhost:8080/api/auth/login
send request to this endpoint with email and password