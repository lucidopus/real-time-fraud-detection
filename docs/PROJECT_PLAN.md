# Real-Time Fraud Call Detection Agent

## What I Want to Build
I am building a vigilant AI guardian that sits quietly during my phone calls, listening for signs of deception. Think of it as a knowledgeable friend who taps me on the shoulder when a conversation sounds suspicious. It doesn't just give a generic warning; it understands the context of the scam in real-time, explains *why* I'm being targeted, and verbally guides me on how to handle the situation safely.

## The Core Problem
Phone scams are becoming increasingly sophisticated, often bypassing traditional spam filters and relying on social engineering to manipulate victims. In the heat of the moment, fear or urgency can cloud judgment. People need more than just a "Potential Spam" caller ID; they need an active, intelligent ally that can analyze the *content* of the conversation as it happens and intervene before damage is done.

## How It Will Work
The system will operate as a "man-in-the-middle" agent during a call (simulated for the prototype).
1.  **Active Listening & Simulation:** 
    *   **Interactive Demo Interface:** The web interface will feature two distinct buttons: **"Scammer"** and **"User"**.
    *   **Speech-to-Text (STT):** Pressing a button activates the microphone for that role, transcribing the speech in real-time to populate the conversation log. This simulates the live call audio stream.
2.  **Continuous Vigilance:** Every time the conversation naturally pauses (e.g., every 2 turns), the system analyzes the exchange.
3.  **Instant Classification:** It uses a specialized lightweight AI model to instantly flag if the conversation is fraudulent or safe.
4.  **Deep Reasoning & Context:** If fraud is detected, a more powerful reasoning engine kicks in. It pulls data from a database of known scam patterns to understand the specific type of attack (e.g., "Grandparent Scam," "IRS Impersonation").
5.  **Intervention:**
    *   **Visual:** A warning flashes on the screen.
    *   **Auditory:** The agent speaks up (using a distinct, trusted voice) to explain exactly why this is a scam and advises me on what to do next (e.g., "Hang up, they are trying to scare you into sending money via gift cards").

## The Experience I Want
I want the experience to feel seamless and reassuring, not intrusive.
*   **Normal Mode:** When I'm talking to my mom or ordering pizza, the agent is invisible. Zero friction.
*   **Alert Mode:** As soon as the conversation turns malicious, the agent becomes assertive. It feels like a protective shield going up. The advice shouldn't sound robotic; it should sound like a smart consultant whispering in my ear, grounded in facts from similar real-world cases.

## Essential Requirements & Technical Specifications
*   **Platform:** Web Application (Browser-based).
*   **Voice/Speech Generation:** **ElevenLabs API** must be used for the agent's voice to ensure it sounds natural and authoritative.
*   **Fraud Classification:** Must use the specific Hugging Face model: `shakeleoatmeal/Fraud-call-detection-Qwen-0.5B-Lora` for the initial 0/1 classification.
*   **Knowledge Base (RAG):** **Redis** will be used to store and retrieve summaries of similar scam cases to feed the reasoning engine.
*   **Reasoning Engine:** An LLM that takes the conversation history + RAG context to generate the specific advice.
*   **Trigger Mechanism:** Classification runs periodically (e.g., every 2 conversation turns).

## Success Metrics
*   **Accuracy:** The system correctly identifies the scam conversation without false positives on normal conversation.
*   **Latency:** The warning and voice advice must appear/play quickly enough to prevent the user from taking the scammer's requested action.
*   **Clarity:** The generated advice must be specific to the scam context (not just "This is a scam," but "This matches the pattern of a refund scam").
*   **Theme Alignment:** Effective use of ElevenLabs for the conversational agent aspect.

## The Bigger Picture
This project isn't just about blocking calls; it's about empowering vulnerable populations (like the elderly) with an always-on AI companion that protects their financial well-being. By combining real-time analysis with a human-like voice interface, we bridge the gap between complex fraud detection technology and simple, actionable human advice.
