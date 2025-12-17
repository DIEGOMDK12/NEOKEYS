import RegisterForm from "../RegisterForm";

export default function RegisterFormExample() {
  return (
    <div className="p-4 bg-background">
      <RegisterForm
        onRegister={(data) => console.log("Register:", data)}
        onLogin={() => console.log("Go to login")}
      />
    </div>
  );
}
