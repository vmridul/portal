import { SignUp } from "@clerk/nextjs";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  weight: ["400", "600"],
  subsets: ["latin"],
});

export default function SignUpPage() {
  return (
    <div className={`min-h-screen w-full bg-[#080e2a] flex items-center justify-center relative overflow-hidden ${lexend.className}`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#5c3dd8]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c4fd4]/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <SignUp 
          routing="path"
          path="/signup"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
