import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onLogin, onCreateAccount, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar em minha conta</CardTitle>
        <p className="text-sm text-muted-foreground">Insira seu e-mail e senha:</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              data-testid="input-login-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              data-testid="input-login-password"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-login">
            Entrar
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Este site e protegido por hCaptcha e a Politica de privacidade e os Termos de servico do
          hCaptcha se aplicam.
        </p>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm">
            Novo cliente?{" "}
            <button
              onClick={onCreateAccount}
              className="text-primary hover:underline"
              data-testid="link-create-account"
            >
              Criar sua conta
            </button>
          </p>
          <p className="text-sm">
            Esqueceu sua senha?{" "}
            <button
              onClick={onForgotPassword}
              className="text-primary hover:underline"
              data-testid="link-forgot-password"
            >
              Recuperar senha
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
