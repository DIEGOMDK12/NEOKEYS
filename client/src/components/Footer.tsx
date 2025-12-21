import { useState } from "react";
import { ChevronDown, ChevronUp, Facebook, Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FooterSection({ title, children }: FooterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 px-4 text-left"
        data-testid={`button-footer-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-white font-semibold text-sm uppercase">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-white" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmail("");
    }
  };

  return (
    <footer className="bg-card mt-8">
      <FooterSection title="POLÍTICA E INFORMAÇÕES">
        <a href="#" className="block hover:text-foreground">Política de Privacidade</a>
        <a href="#" className="block hover:text-foreground">Termos de Uso</a>
        <a href="#" className="block hover:text-foreground">Política de Reembolso</a>
        <a href="#" className="block hover:text-foreground">FAQ - Perguntas Frequentes</a>
      </FooterSection>

      <FooterSection title="CONTATO:">
        <p>Email: contato@elitevault.com</p>
        <p>WhatsApp: (00) 00000-0000</p>
        <p>Horário: Seg-Sex 9h às 18h</p>
      </FooterSection>

      <div className="border-t border-border p-4">
        <h3 className="text-white font-semibold text-sm uppercase mb-3">NEWSLETTER</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Inscreva-se para receber as últimas novidades no seu e-mail
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border"
            data-testid="input-newsletter-email"
          />
          <Button 
            type="submit" 
            variant="outline" 
            className="border-white text-white"
            data-testid="button-newsletter-submit"
          >
            Enviar
          </Button>
        </form>
      </div>

      <div className="border-t border-border p-4">
        <p className="text-sm text-muted-foreground mb-3">Siga-nos</p>
        <div className="flex items-center gap-3">
          <a 
            href="#" 
            className="h-8 w-8 rounded-full border border-muted-foreground flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground"
            data-testid="link-facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a 
            href="#" 
            className="h-8 w-8 rounded-full border border-muted-foreground flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground"
            data-testid="link-instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a 
            href="#" 
            className="h-8 w-8 rounded-full border border-muted-foreground flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground"
            data-testid="link-tiktok"
          >
            <SiTiktok className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-border p-4 text-center">
        <p className="text-sm text-muted-foreground">© 2025 NEO-KEYS</p>
      </div>
    </footer>
  );
}
