import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ROSCO – Join the Waitlist",
  description:
    "Tell us a bit about your handyman business and we’ll reach out when ROSCO is ready for you.",
};

export default function SignupIntentPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#111113", color: "#EBEBF5" }}
    >
      <div
        className="w-full max-w-lg rounded-[28px] p-8 md:p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(17,17,19,0.98), #18181B)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.20) 0%, transparent 65%)",
          }}
        />
        <div className="relative">
          <p
            className="inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.18em] mb-4"
            style={{
              background: "rgba(255,107,53,0.16)",
              border: "1px solid rgba(255,107,53,0.40)",
              color: "#FF6B35",
            }}
          >
            Early access
          </p>

          <h1 className="text-[clamp(1.8rem,3vw,2.3rem)] font-extrabold tracking-tight text-white mb-2">
            Be the first to try ROSCO
          </h1>
          <p
            className="text-[14px] mb-6 leading-relaxed"
            style={{ color: "rgba(235,235,245,0.55)" }}
          >
            We’re rolling ROSCO out with a small group of handyman businesses.
            Leave your details and we’ll reach out as we open new spots.
          </p>

          <form
            className="space-y-4"
            action="https://formspree.io/f/mdaldqoa"
            method="POST"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-[13px] font-medium"
                style={{ color: "rgba(235,235,245,0.80)" }}
              >
                Your name
              </label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Alex, owner of Fix-It Pros"
                className="bg-transparent border-white/10 text-[14px] placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-medium"
                style={{ color: "rgba(235,235,245,0.80)" }}
              >
                Work email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="bg-transparent border-white/10 text-[14px] placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="company"
                className="text-[13px] font-medium"
                style={{ color: "rgba(235,235,245,0.80)" }}
              >
                Business name
              </label>
              <Input
                id="company"
                name="company"
                required
                placeholder="Your handyman business name"
                className="bg-transparent border-white/10 text-[14px] placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="size"
                className="text-[13px] font-medium"
                style={{ color: "rgba(235,235,245,0.80)" }}
              >
                Team size
              </label>
              <Input
                id="size"
                name="team_size"
                placeholder="e.g. 3 handymen, 1 dispatcher"
                className="bg-transparent border-white/10 text-[14px] placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="notes"
                className="text-[13px] font-medium"
                style={{ color: "rgba(235,235,245,0.80)" }}
              >
                What are you hoping ROSCO will help with?
              </label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Short description of your current workflow and what’s painful today."
                className="bg-transparent border-white/10 text-[14px] placeholder:text-white/30 resize-none"
              />
            </div>

            <input type="hidden" name="source" value="marketing-page" />

            <Button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-[12px] text-[15px] font-semibold"
              style={{
                background: "linear-gradient(135deg, #FF6B35, #FF4500)",
                boxShadow:
                  "0 8px 24px rgba(255,107,53,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              Submit interest
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p
              className="mt-3 text-[11px] text-center leading-relaxed"
              style={{ color: "rgba(235,235,245,0.40)" }}
            >
              We’ll only use this info to contact you about ROSCO. No spam, no
              sharing your details.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

