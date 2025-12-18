import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegisterFormProps {
  onRegister: (data: { firstName: string; lastName: string; email: string; password: string }) => void;
  onLogin: () => void;
}

export default function RegisterForm({ onRegister, onLogin }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ firstName, lastName, email, password });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar minha conta</CardTitle>
        <p className="text-sm text-muted-foreground">Preencha os campos abaixo:</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Primeiro nome</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Primeiro nome"
              data-testid="input-register-firstname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Sobrenome"
              data-testid="input-register-lastname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regEmail">E-mail</Label>
            <Input
              id="regEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              data-testid="input-register-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regPassword">Senha</Label>
            <Input
              id="regPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              data-testid="input-register-password"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-register">
            Criar minha conta
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Este site e protegido por hCaptcha e a Politica de privacidade e os Termos de servico do
          hCaptcha se aplicam.
        </p>

        <div className="text-center mt-6">
          <p className="text-sm">
            Ja tem uma conta?{" "}
            <button onClick={onLogin} className="text-white hover:underline" data-testid="link-login">
              Entre aqui
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
