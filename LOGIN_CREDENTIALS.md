# Login Credentials Reference

## 🔐 Admin Login (Username/Password)
- **Username**: `admin`
- **Password**: `password`
- **Role**: `admin`
- **Access**: Full admin dashboard

## 🔐 Alternative Admin Login
- **Username**: `michie`
- **Password**: (Check database for current password)
- **Role**: `admin`

## 👥 Cashier Login (Employee ID/PIN)
- **Employee ID**: `EMP001`
- **PIN**: `password`
- **Username**: `john_doe`
- **Role**: `cashier`

## 👥 Alternative Cashier Login
- **Employee ID**: `EMP002`
- **PIN**: `password`
- **Username**: `jane_cashier`
- **Role**: `cashier`

## 📋 How to Login

### Admin Login:
1. Go to `loginRegister.html`
2. Click "Admin" tab
3. Enter username and password
4. Click "Admin Login"
5. Redirected to `index.php` (admin dashboard)

### Cashier Login:
1. Go to `loginRegister.html`
2. Click "Employee" tab (default)
3. Enter Employee ID and PIN
4. Click "Cashier Login"
5. Redirected to `cashier.html` (cashier dashboard)

## 🔧 Testing
Use `test_login_buttons.html` to test both login methods:
- Test admin login with username/password
- Test cashier login with employee ID/PIN
- Check database users
- Debug JavaScript loading

## ✅ System Status
- ✅ Admin login working
- ✅ Cashier login working
- ✅ Database properly configured
- ✅ All roles properly set up
- ✅ PIN authentication working
- ✅ Session management working

**Last Updated**: $(date)
