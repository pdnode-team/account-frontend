"use client"
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function RegisterForm() {
  return (
    // 外层容器和居中布局 (使用 Tailwind CSS)
    <div className="w-full h-screen flex justify-center items-center bg-gray-200">
      {/* 注册表单容器 (使用 Tailwind CSS) */}
      <div className="bg-white p-10 md:p-12 lg:p-16 flex flex-col items-center rounded-2xl shadow-xl w-full max-w-sm">

        {/* 标题 */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Register
        </Typography>

        {/* 表单容器，使用 Box 来管理 MUI 组件的布局和间距 */}
        <Box 
          component="form" 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, // 快速设置子元素之间的间距
            width: '100%' 
          }}
          noValidate
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* 1. 用户名输入框 */}
          <TextField 
            required 
            id="username" 
            label="Username" 
            variant="outlined" 
            fullWidth 
          />

          {/* 2. 邮箱输入框 */}
          <TextField 
            required 
            id="email" 
            label="Email" 
            type="email" 
            variant="outlined" 
            fullWidth 
          />

          {/* 3. 密码输入框 */}
          <TextField 
            required 
            id="password" 
            label="Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
          />

          {/* 4. 确认密码输入框 */}
          <TextField 
            required 
            id="confirm-password" 
            label="Re-Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            sx={{ mb: 1 }} // 在按钮前额外添加一点间距
          />

          {/* 5. 注册按钮 */}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            fullWidth
          >
            Register
          </Button>
        </Box>
        
        {/* 底部链接或信息 */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Have a Account? <a href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>Login</a>
        </Typography>
      </div>
    </div>
  );
}