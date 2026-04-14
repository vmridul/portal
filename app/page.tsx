"use client";
import { Galindo } from "next/font/google";
import { Lexend } from "next/font/google";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});
const lexend = Lexend({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export default function Page() {
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
    <section className="h-screen bg-[#080e2a] overflow-y-auto overflow-x-hidden relative flex flex-col">
      <div className="flex flex-col items-center">
        <svg
          className="absolute -top-32 z-[0]"
          viewBox="0 0 1440 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5c3dd8" />
              <stop offset="100%" stopColor="#4a31b0" />
            </linearGradient>
          </defs>

          <path
            d="
  M 0 200
  Q 0 0 200 0
  L 1240 0
  Q 1440 0 1440 200
  L 1440 520

  C 1200 900 950 700 780 900
  C 600 1050 360 950 200 800
  C 100 720 40 650 0 520

  Z
"
            fill="url(#purpleGradient)"
          />
        </svg>
        <div className="flex flex-col items-center mt-48 z-[1]">
          <span className={`${galindo.className} text-white text-8xl`}>
            Portal
          </span>
          <span className="text-xl text-white">
            Realtime conversation without friction
          </span>
          <button
            onClick={loginWithGoogle}
            className="text-white cursor-pointer bg-white mt-4 bg-opacity-20 backdrop-blur-lg px-6 py-2 rounded-[8px]"
          >
            Enter
          </button>
        </div>
        <Image
          src="/assets/ss.png"
          width={screen.width}
          height={screen.height}
          style={{
            transform: "perspective(1000px) rotateX(5deg)",
            transformOrigin: "bottom center",
          }}
          className="z-[1] w-[90%] rounded-[20px] shadow-2xl shadow-theme-base border border-theme-border"
          alt="Hero screenshot"
        />
        <svg
          viewBox="0 0 1440 1400"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-[80%] z-[30] left-0 w-full pointer-events-none"
        >
          {/* Arm — sweeps from far right bottom to upper left where hand is */}
          <path
            fill="#7c4fd4"
            d="M 1440 1400 C 1380 1180 1300 980 1180 820 C 1060 660 880 600 740 500 C 620 415 540 360 490 320 L 560 280 C 612 318 694 374 816 458 C 960 558 1142 616 1264 778 C 1386 940 1462 1142 1520 1400 Z"
          />
          <path
            fill="#5a32a8"
            opacity="0.4"
            d="M 1440 1400 C 1380 1180 1300 980 1180 820 C 1140 768 1090 726 1040 690 L 1020 710 C 1070 746 1118 788 1158 840 C 1278 1002 1356 1202 1416 1400 Z"
          />

          {/* Sleeve cuffs */}
          <path
            fill="#7c4fd4"
            d="M 478 318 C 474 295 478 272 492 256 C 503 244 518 238 536 236 L 552 234 L 552 262 C 536 264 524 270 518 284 C 510 300 512 318 515 332 Z"
          />
          <path
            fill="#7c4fd4"
            d="M 608 318 C 612 295 608 272 594 256 C 583 244 568 238 550 236 L 534 234 L 534 262 C 550 264 562 270 568 284 C 576 300 574 318 571 332 Z"
          />

          {/* Palm */}
          <path
            fill="#7B4A2D"
            d="M 498 348 C 490 334 490 318 497 304 C 504 291 516 283 532 279 L 554 276 L 576 279 C 590 283 601 291 606 304 C 612 318 610 334 603 348 C 593 366 577 376 560 380 L 546 382 L 530 380 C 514 376 506 366 498 348 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 498 348 C 493 336 494 322 499 310 C 496 322 496 336 501 350 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.2"
            d="M 603 348 C 608 336 607 322 602 310 C 605 322 605 336 600 350 Z"
          />

          {/* Thumb */}
          <path
            fill="#7B4A2D"
            d="M 492 340 C 482 328 476 312 478 297 C 480 284 488 274 498 272 C 505 272 510 277 512 287 C 515 299 510 316 504 330 C 500 340 495 347 491 344 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.35"
            d="M 484 324 C 481 314 484 303 490 297 C 487 305 486 315 488 324 Z"
          />
          <path
            fill="none"
            stroke="#4a2010"
            strokeWidth="1"
            strokeLinecap="round"
            d="M 493 318 Q 500 315 506 319"
            opacity="0.4"
          />
          <path
            fill="#b87050"
            opacity="0.7"
            d="M 496 277 C 495 272 499 269 503 270 C 507 271 509 275 507 279 Z"
          />

          {/* Index finger tip */}
          <path
            fill="#7B4A2D"
            d="M 522 248 C 519 238 520 226 524 217 C 527 210 533 206 539 207 C 545 208 549 214 550 223 C 551 232 548 244 543 251 C 539 257 533 260 528 258 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 524 234 C 523 226 526 219 531 216 C 528 222 527 230 529 237 Z"
          />
          <path
            fill="#b87050"
            opacity="0.65"
            d="M 527 210 C 526 206 530 204 534 205 C 537 206 539 209 537 213 Z"
          />

          {/* Middle finger tip */}
          <path
            fill="#7B4A2D"
            d="M 542 244 C 539 233 540 219 545 209 C 548 201 555 197 562 198 C 569 199 573 205 574 215 C 575 225 572 238 567 246 C 563 253 557 257 551 255 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 544 228 C 543 219 547 211 553 208 C 549 215 548 224 550 232 Z"
          />
          <path
            fill="#b87050"
            opacity="0.65"
            d="M 548 201 C 547 197 551 195 556 196 C 560 197 561 201 560 204 Z"
          />

          {/* Ring finger tip */}
          <path
            fill="#7B4A2D"
            d="M 564 248 C 561 237 562 223 567 213 C 571 205 578 201 585 202 C 592 203 596 209 597 219 C 598 229 595 242 590 250 C 586 257 579 261 573 259 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 566 233 C 565 224 569 215 575 212 C 571 219 570 228 572 236 Z"
          />
          <path
            fill="#b87050"
            opacity="0.65"
            d="M 570 205 C 569 201 573 199 577 200 C 581 201 582 205 581 208 Z"
          />

          {/* Pinky tip */}
          <path
            fill="#7B4A2D"
            d="M 586 258 C 584 249 585 238 589 230 C 592 223 598 219 604 220 C 610 221 613 227 614 236 C 615 245 612 256 607 263 C 603 268 597 271 592 269 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 588 246 C 587 238 591 230 596 227 C 592 234 591 242 593 250 Z"
          />
          <path
            fill="#b87050"
            opacity="0.65"
            d="M 591 223 C 590 219 594 217 598 218 C 602 219 603 222 601 226 Z"
          />

          {/* Phone */}
          <g transform="translate(512, 192) rotate(-5, 52, 88)">
            <rect fill="#111128" x="0" y="0" width="104" height="182" rx="14" />
            <rect fill="#222240" x="4" y="5" width="96" height="172" rx="11" />
            <rect fill="#2a2a50" x="7" y="9" width="90" height="158" rx="9" />
          </g>

          {/* Side grip */}
          <path
            fill="#7B4A2D"
            d="M 508 290 C 503 282 500 270 503 259 C 505 250 511 244 518 244 C 523 244 527 248 528 256 C 529 265 526 278 521 288 C 517 296 511 301 508 299 Z"
          />
          <path
            fill="#4a2010"
            opacity="0.3"
            d="M 510 275 C 508 266 511 257 516 253 C 512 260 511 270 513 278 Z"
          />
        </svg>
      </div>
      <div className="z-[1] ml-40 text-white mt-20">
        <span className={`text-7xl ${lexend.className}`}>
          Privacy
          <br /> First
        </span>
        <div className="flex flex-col gap-6 mt-6 relative">
          <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
            End to end encryption
          </div>
          <div className="absolute top-8 left-12 h-10 z-[0]  border-l-2 border-dotted border-gray-500"></div>
          <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
            No data collection
          </div>
          <div className="absolute top-24 left-12 h-10 z-[0]  border-l-2 border-dotted border-gray-500"></div>
          <div className="bg-[#0f0d15] w-fit z-[2] text-md rounded-[8px] px-6 py-2">
            No tracking
          </div>
        </div>
      </div>
    </section>
  );
}
