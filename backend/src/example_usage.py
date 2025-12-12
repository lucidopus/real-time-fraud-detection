"""
Example usage of Redis RAG integration with ElevenLabs agent
"""
from reasoning import ElevenLabsRedisIntegration

# Initialize the integration
integration = ElevenLabsRedisIntegration()

# Example: Add scam cases to Redis knowledge base
print("Adding scam cases to Redis...")
integration.add_scam_case(
    case_id="1",
    scam_type="Grandparent Scam",
    description="Scammer pretends to be a grandchild in distress, asking for money urgently via gift cards or wire transfer. Uses emotional manipulation and urgency tactics.",
    summary="Impersonates family member in emergency, requests immediate payment"
)

integration.add_scam_case(
    case_id="2",
    scam_type="IRS Impersonation",
    description="Caller claims to be from the IRS, threatening arrest or legal action unless immediate payment is made. Demands payment via gift cards, wire transfer, or cryptocurrency.",
    summary="Fake IRS agent threatens legal action, demands immediate payment"
)

integration.add_scam_case(
    case_id="3",
    scam_type="Tech Support Scam",
    description="Caller claims to be from Microsoft, Apple, or another tech company, saying your computer has a virus. Asks for remote access or payment to fix non-existent problems.",
    summary="Fake tech support requests remote access or payment for fake computer issues"
)

print("\nScam cases added successfully!\n")

# Example: Process a fraud detection scenario
conversation = """
Scammer: Hello, this is your grandson. I'm in jail and need $5,000 for bail immediately!
User: Oh no! Are you okay?
Scammer: Yes, but I need you to go to the store right now and buy $5,000 in gift cards. Please hurry!
"""

print("Processing fraud detection...")
print(f"Conversation:\n{conversation}\n")

result = integration.process_fraud_detection(conversation)

print("Retrieved Context from Redis:")
print(result["context_used"])
print("\n" + "="*50 + "\n")

print("Agent Response:")
print(result["response"])

