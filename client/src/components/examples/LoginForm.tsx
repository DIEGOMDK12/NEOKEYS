import LoginForm from "../LoginForm";

export default function LoginFormExample() {
  return (
    <div className="p-4 bg-background">
      <LoginForm
        onLogin={(email, pwd) => console.log("Login:", email, pwd)}
        onCreateAccount={() => console.log("Create account")}
        onForgotPassword={() => console.log("Forgot password")}
      />
    </div>
  );
}
