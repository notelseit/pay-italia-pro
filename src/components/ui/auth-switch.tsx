import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Mail, Lock, User, Building, Facebook, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthSwitchProps {
  // Sign In
  loginEmail: string;
  loginPassword: string;
  onLoginEmailChange: (v: string) => void;
  onLoginPasswordChange: (v: string) => void;
  onSignIn: (e: React.FormEvent) => void;
  // Sign Up
  registerFullName: string;
  registerCompanyName: string;
  registerEmail: string;
  registerPassword: string;
  registerConfirmPassword: string;
  onRegisterFullNameChange: (v: string) => void;
  onRegisterCompanyNameChange: (v: string) => void;
  onRegisterEmailChange: (v: string) => void;
  onRegisterPasswordChange: (v: string) => void;
  onRegisterConfirmPasswordChange: (v: string) => void;
  onSignUp: (e: React.FormEvent) => void;
  // Shared
  isLoading: boolean;
  onForgotPassword?: () => void;
  children?: React.ReactNode; // for dialog etc.
}

export function AuthSwitch(props: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isSignUp) el.classList.add("sign-up-mode");
    else el.classList.remove("sign-up-mode");
  }, [isSignUp]);

  return (
    <>
      <style>{`
        .auth-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }
        .auth-container::before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: var(--gradient-hero, linear-gradient(135deg, hsl(217 83% 51%) 0%, hsl(217 83% 65%) 100%));
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }
        .auth-container.sign-up-mode::before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .auth-signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }
        .auth-container.sign-up-mode .auth-signin-signup {
          left: 25%;
        }

        .auth-sign-in-form,
        .auth-sign-up-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 2rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }
        .auth-sign-up-form {
          opacity: 0;
          z-index: 1;
        }
        .auth-sign-in-form {
          z-index: 2;
        }
        .auth-container.sign-up-mode .auth-sign-in-form {
          opacity: 0;
          z-index: 1;
        }
        .auth-container.sign-up-mode .auth-sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        .auth-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }
        .auth-left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }
        .auth-right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }
        .auth-panel .auth-content {
          color: hsl(0 0% 100%);
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }
        .auth-right-panel .auth-content {
          transform: translateX(800px);
        }
        .auth-container.sign-up-mode .auth-right-panel .auth-content {
          transform: translateX(0);
        }
        .auth-container.sign-up-mode .auth-left-panel .auth-content {
          transform: translateX(-800px);
        }
        .auth-container.sign-up-mode .auth-left-panel {
          pointer-events: none;
        }
        .auth-container.sign-up-mode .auth-right-panel {
          pointer-events: all;
        }

        @media (max-width: 870px) {
          .auth-container { min-height: 800px; height: 100vh; }
          .auth-signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .auth-signin-signup,
          .auth-container.sign-up-mode .auth-signin-signup {
            left: 50%;
          }
          .auth-panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .auth-panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .auth-right-panel { grid-row: 3 / 4; }
          .auth-left-panel { grid-row: 1 / 2; }
          .auth-panel .auth-content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .auth-container::before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode::before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-container.sign-up-mode .auth-left-panel .auth-content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .auth-right-panel .auth-content {
            transform: translateY(0);
          }
          .auth-right-panel .auth-content {
            transform: translateY(300px);
          }
          .auth-container.sign-up-mode .auth-signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-sign-in-form,
          .auth-sign-up-form {
            padding: 0 1.5rem;
          }
          .auth-panel .auth-content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div ref={containerRef} className="auth-container bg-background">
        <div className="auth-forms-container">
          <div className="auth-signin-signup">
            {/* Sign In Form */}
            <form onSubmit={props.onSignIn} className="auth-sign-in-form">
              <h2 className="text-2xl font-bold text-foreground mb-6">Accedi</h2>

              <div className="relative w-full max-w-[380px] mb-3">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email aziendale"
                  className="pl-10"
                  value={props.loginEmail}
                  onChange={(e) => props.onLoginEmailChange(e.target.value)}
                  required
                />
              </div>

              <div className="relative w-full max-w-[380px] mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={props.loginPassword}
                  onChange={(e) => props.onLoginPasswordChange(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full max-w-[380px] mb-3" disabled={props.isLoading}>
                {props.isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>

              {props.onForgotPassword && (
                <button
                  type="button"
                  onClick={props.onForgotPassword}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Password dimenticata?
                </button>
              )}
            </form>

            {/* Sign Up Form */}
            <form onSubmit={props.onSignUp} className="auth-sign-up-form">
              <h2 className="text-2xl font-bold text-foreground mb-6">Registrati</h2>

              <div className="relative w-full max-w-[380px] mb-3">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome Completo"
                  className="pl-10"
                  value={props.registerFullName}
                  onChange={(e) => props.onRegisterFullNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="relative w-full max-w-[380px] mb-3">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome Azienda"
                  className="pl-10"
                  value={props.registerCompanyName}
                  onChange={(e) => props.onRegisterCompanyNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="relative w-full max-w-[380px] mb-3">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email aziendale"
                  className="pl-10"
                  value={props.registerEmail}
                  onChange={(e) => props.onRegisterEmailChange(e.target.value)}
                  required
                />
              </div>

              <div className="relative w-full max-w-[380px] mb-3">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={props.registerPassword}
                  onChange={(e) => props.onRegisterPasswordChange(e.target.value)}
                  required
                />
              </div>

              <div className="relative w-full max-w-[380px] mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Conferma Password"
                  className="pl-10"
                  value={props.registerConfirmPassword}
                  onChange={(e) => props.onRegisterConfirmPasswordChange(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full max-w-[380px]" disabled={props.isLoading}>
                {props.isLoading ? "Registrazione in corso..." : "Crea Account"}
              </Button>
            </form>
          </div>
        </div>

        {/* Panels */}
        <div className="auth-panels-container">
          <div className="auth-panel auth-left-panel">
            <div className="auth-content">
              <h3 className="text-2xl font-bold mb-2">Nuovo qui?</h3>
              <p className="text-sm opacity-90 mb-4">
                Unisciti a noi oggi e scopri tutte le potenzialità di PayHub. Crea il tuo account in pochi secondi!
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="rounded-full border-2 border-white px-8 py-2.5 text-sm font-semibold text-white bg-transparent hover:bg-white/10 transition-colors"
              >
                Registrati
              </button>
            </div>
          </div>

          <div className="auth-panel auth-right-panel">
            <div className="auth-content">
              <h3 className="text-2xl font-bold mb-2">Già registrato?</h3>
              <p className="text-sm opacity-90 mb-4">
                Bentornato! Accedi per continuare a gestire la tua azienda con PayHub.
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="rounded-full border-2 border-white px-8 py-2.5 text-sm font-semibold text-white bg-transparent hover:bg-white/10 transition-colors"
              >
                Accedi
              </button>
            </div>
          </div>
        </div>

        {/* Extra children (e.g. dialog) */}
        {props.children}
      </div>
    </>
  );
}
