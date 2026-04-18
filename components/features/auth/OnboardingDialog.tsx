"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ArrowRight, Check } from "lucide-react";
import { useUserProfileActions } from "@/hooks";
import { toast } from "sonner";
import { Galindo } from "next/font/google";
import { cn } from "@/lib/utils";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});

interface OnboardingDialogProps {
  onComplete: () => void;
}

export const OnboardingDialog = ({ onComplete }: OnboardingDialogProps) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("/assets/defaultAvatar.png");
  const [isUploading, setIsUploading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { createUser, generateUploadUrl, getUrl } = useUserProfileActions();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const newAvatarUrl = await getUrl(storageId);
      if (newAvatarUrl) {
        setAvatar(newAvatarUrl);
        toast.success("Avatar uploaded");
      }
    } catch (e) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = async () => {
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    setIsFinishing(true);
    try {
      await createUser({ username, avatar });
      toast.success("Welcome to Portal!");
      onComplete();
    } catch (e) {
      toast.error("Failed to create profile");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[url('/assets/asciiHero.png')] bg-cover bg-center fade-slow opacity-40 -z-10" />
      <div className="relative w-full max-w-lg bg-theme-surface border border-theme-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="relative overflow-hidden transition-all duration-500 h-[480px]">
          {/* Step 1 */}
          <div className={cn(
            "transition-all duration-500 ease-in-out absolute flex flex-col justify-start gap-12 inset-0",
            step === 1
              ? "opacity-100 translate-x-0 scale-100"
              : "opacity-0 -translate-x-full scale-95 pointer-events-none"
          )}>
            <div className="bg-[url('/assets/portal.png')] w-full h-48 bg-cover bg-center">

            </div>

            <div className="flex flex-col items-center text-center py-6 gap-6">
              <div>
                <h1
                  className={`${galindo.className} text-3xl font-bold text-white mb-2`}
                >
                  Portal
                </h1>
                <p className="text-gray-300">Let's get your profile set up.</p>
              </div>
              <button
                onClick={() => {
                  setStep(2);
                }}
                className="bg-purple-700 hover:bg-purple-800 shadow-sm shadow-purple-700/50 hover:text-gray-200 duration-200 transition-all text-white py-4 px-8 flex text-sm items-center gap-1 ease-in-out hover:brightness-110 hover:opacity-90 rounded-xl"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className={cn(
            "p-8 transition-all duration-500 ease-in-out absolute inset-0",
            step === 2
              ? "opacity-100 translate-x-0 scale-100"
              : "opacity-0 translate-x-full scale-95 pointer-events-none"
          )}>
            <div className="flex flex-col space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Set up your profile
                </h2>
                <p className="text-sm text-gray-300">
                  This is how others will see you.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div
                  className="relative group cursor-pointer flex flex-col gap-1"
                  onClick={() => !isUploading && fileRef.current?.click()}
                >
                  <span className="text-xs text-gray-300 pl-1">Avatar</span>
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-theme-border group-hover:border-theme-primary transition-colors">
                    <Image
                      src={avatar}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="w-full space-y-2 flex flex-col">
                  <span className="text-xs text-gray-300 pl-1">Username</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Otus"
                    className="w-[100%] outline-none border disabled:opacity-70 placeholder-gray-400 border-theme-border rounded-[8px] text-[#e3e3e3] bg-theme-hover py-2 px-3"
                  />
                  <span className="text-xs text-gray-400 pl-1">You can change your username anytime.</span>
                </div>
              </div>

              <div className="flex gap-2 items-center w-full">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 bg-theme-border hover:bg-theme-hover hover:text-gray-200 duration-200 transition-all text-sm text-white py-3 rounded-xl"
                >
                  Back
                </button>
                <button
                  disabled={!username || username.length < 3 || isFinishing}
                  onClick={handleFinish}
                  className="bg-purple-700 justify-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed  hover:bg-purple-800 shadow-sm shadow-purple-700/50 hover:text-gray-200 duration-200 transition-all text-white py-3 px-6 flex text-sm items-center gap-1 ease-in-out hover:brightness-110 hover:opacity-90 rounded-xl"
                >
                  {isFinishing ? (
                    <div className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Finish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
