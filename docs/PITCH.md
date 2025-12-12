# CallGuard - 60 Second Pitch Script

## TIMING OVERVIEW

| Section | Time | Duration |
|---------|------|----------|
| Live Scam (you → teammate) | 0:00 - 0:05 | 5 sec |
| Hook (context + stats) | 0:05 - 0:20 | 15 sec |
| Demo (alert + LLM explanation) | 0:20 - 0:50 | 30 sec |
| Close | 0:50 - 1:00 | 10 sec |

---

## SETUP BEFORE PITCH

1. Demo pre-loaded at `http://localhost:5173`
2. Click "Try Demo Scam Call" when you walk on stage
3. Teammate is next to you, ready for the bit
4. Alert will fire ~3 seconds into your pitch (during the hook)

---

## 0:00 - 0:05 | LIVE SCAM ATTEMPT

**[Turn to teammate, urgent voice]**

> *"Hey—I need you to wire $5,000 right now. It's urgent. Don't ask questions, just do it."*

**[Teammate looks confused/hesitant]**

**[Turn back to audience]**

---

## 0:05 - 0:20 | HOOK

> *"That's exactly what happened to an employee at Arup—except the person asking was a deepfake of his CFO. He wired $25 million.*

> *The FBI reports $2.77 billion lost to these attacks every year. And right now, there's zero protection during live calls."*

**[SCAM DETECTED alert fires on screen behind you]**

**[Point to screen]**

> *"Until now."*

---

## 0:20 - 0:50 | DEMO

> *"This is CallGuard. It just caught my scam attempt in real-time."*

**[Walk to screen, point to alert]**

> *"85% confidence. CEO fraud pattern. It tells the employee exactly what to do—put them on hold, don't send anything, verify through official channels."*

**[Click "Yes, On Hold" → Post-Call Analysis appears]**

**[Let audio explanation play for 3-4 seconds]**

> *"And after the call, it explains exactly why that was a scam—out loud—so even a stressed employee understands what just happened. One click sends the report to security."*

---

## 0:50 - 1:00 | CLOSE

> *"CallGuard. Real-time AI protection for the calls your security training can't attend.*

> *Thank you."*

---

## BACKUP (if demo fails)

> *"CallGuard monitors calls in real-time. When someone says 'wire this money' or 'verify your password,' it catches the pattern instantly, alerts the employee, and explains exactly why it's a scam. Protection during the call—not after the damage is done."*

---

## DEMO BACKUP PLAN

If the demo fails (browser issues, etc.):

> *"Let me walk you through what happens: the employee is on a call, CallGuard is transcribing in real-time. When the caller says 'verify your password'—that phrase matches our IT credential harvesting pattern. Instantly, a full-screen alert appears: SCAM DETECTED. The employee sees the risk score, the specific phrases that triggered it, and clear instructions: put them on hold, don't share anything, verify through official channels. After the call, they get an audio explanation and can export the incident to security with one click."*

---

## KEY STATS TO REMEMBER

- **$25 million** - Arup deepfake scam (February 2024)
- **$2.77 billion** - Annual BEC losses (FBI IC3 2024)
- **$55 billion** - Total losses since 2015 (FBI IC3)
- **15 transfers** - How many the Arup employee made before realizing

---

## SOURCES

- CNN: https://www.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk
- FBI IC3 2024 Report: https://www.ic3.gov/AnnualReport/Reports/2023_IC3Report.pdf
- FBI IC3 PSA ($55B): https://www.ic3.gov/PSA/2024/PSA240911

---

## Q&A PREP

**Q: How is this different from security training?**
> Training teaches employees what to watch for. CallGuard watches for them—in real-time, during the call, when they're under pressure.

**Q: How do you capture phone audio?**
> Phase 1 is browser-based for demos. Phase 2 is a desktop app that captures system audio. Phase 3 integrates directly with Zoom, Teams, and RingCentral APIs.

**Q: What about privacy/recording laws?**
> Same compliance as any call recording or transcription tool. Enterprise deploys with employee consent as part of security policy.

**Q: How accurate is the detection?**
> Pattern matching catches known attack types with high confidence. ML backend (roadmap) will learn from real attack data to catch novel variants.

**Q: Who are your competitors?**
> Email security (Proofpoint, Abnormal) protects email. Security training (KnowBe4) is annual. Nobody protects live voice calls in real-time.
