"use client";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";


export default function Login({ redirect }: { redirect: string }) {
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/portal");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="z-[9999] ml-1 cursor-pointer flex justify-around items-center rounded-xl">
      <button onClick={loginWithGoogle} className="animated-btn">
        <span className="span-mother">
          <span>E</span>
          <span>N</span>
          <span>T</span>
          <span>E</span>
          <span>R</span>
        </span>

        <span className="span-mother2">
          <span>P</span>
          <span>O</span>
          <span>R</span>
          <span>T</span>
          <span>A</span>
          <span>L</span>
        </span>
      </button>
    </div>
  );
}
