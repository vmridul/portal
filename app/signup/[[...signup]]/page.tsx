import { SignUp } from "@clerk/nextjs";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  weight: ["400", "600"],
  subsets: ["latin"],
});

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full bg-theme-base flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md p-4">
<SignUp 
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl="/portal"
          appearance={{
            elements: {
              rootBox: "bg-theme-surface rounded-xl border border-theme-border",
              card: "bg-theme-surface shadow-none border-none",
              headerTitle: "text-white font-semibold",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-theme-border hover:bg-theme-hover border border-theme-border text-white hover:text-white",
              socialButtonsBlockButtonText: "text-white",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-theme-hover border border-theme-border rounded-lg text-white placeholder-[#666]",
              formButtonPrimary: "bg-theme-accent hover:brightness-110 text-white rounded-lg",
              footerActionLink: "text-theme-accent hover:text-theme-accent/80",
              dividerLine: "bg-theme-border",
              dividerText: "text-gray-400",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-theme-accent",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
              footer: "bg-theme-surface",
              footerPageLink: "text-theme-accent",
              otpCodeFieldInput: "bg-theme-hover border border-theme-border text-white rounded-lg",
              badge: "bg-red-900/50 text-red-200",
              alternativeMethodsText: "text-gray-300",
              enterpriseBrandedSwitchText: "text-gray-300",
              formFieldAction: "text-theme-accent",
              backLink: "text-gray-300 hover:text-white",
              otpCodeFieldInputGroupText: "text-white",
              alternativeMethodsTextButton: "text-white",
            },
            variables: {
              colorPrimary: "#4a31b0",
              colorTextOnPrimary: "#ffffff",
              colorBackground: "#1a1625",
              colorInputBackground: "#252033",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#a0a0a0",
              colorDanger: "#ef4444",
              colorSuccess: "#22c55e",
              fontFamily: lexend.style.fontFamily,
              fontSize: "14px",
              borderRadius: "8px",
              spacingUnit: "8px",
            },
          }}
        />
      </div>
    </div>
  );
}
