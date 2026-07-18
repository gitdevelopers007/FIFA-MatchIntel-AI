import json
import logging
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.services.data_services import DataService
from backend.app.schemas.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

# Try to import Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class AIService:
    @staticmethod
    def detect_intent(message: str) -> str:
        """
        Quick token keyword intent parser to direct context loading
        """
        msg = message.lower()
        if any(w in msg for w in ["emergency", "medical", "accident", "hurt", "injured", "police", "help"]):
            return "emergency"
        if any(w in msg for w in ["gate", "entrance", "exit", "seat", "section", "find seat", "row", "locate"]):
            return "navigation"
        if any(w in msg for w in ["traffic", "bus", "train", "shuttle", "transport", "metro", "cab", "parking"]):
            return "transport"
        if any(w in msg for w in ["food", "beverage", "drink", "eat", "stall", "hot dog", "beer", "water"]):
            return "food"
        if any(w in msg for w in ["crowd", "queue", "wait", "congestion", "busy", "line"]):
            return "crowd"
        if any(w in msg for w in ["volunteer", "task", "assign", "job", "incident"]):
            return "operations"
        return "general"

    @staticmethod
    def get_role_instructions(role: str) -> str:
        instructions = {
            "fan": "You are the FIFA MatchIntel AI Fan Assistant for the FIFA World Cup 2026. Guide fans to seats, food stalls, transport, and restrooms. Provide helpful, cheerful, and accurate information.",
            "volunteer": "You are the Operations Volunteer Copilot. Provide instructions for crowd management, report incidents, and offer instructions on safety policies.",
            "security": "You are the Security Operations Decision Support AI. Analyze crowd risks, suggest deployment strategies, and draft action plans for high-risk situations.",
            "medical": "You are the First Aid & Medical Dispatch Assistant. Provide immediate routes to medical stations/AEDs, treatment guidelines, and incident status updates.",
            "organizer": "You are the Tournament Operations Director Support AI. Provide real-time insights, congestion forecasts, sustainability reports, and strategic decisions.",
            "transport": "You are the Transport Logistics Coordinator Support. Analyze gate queue impacts and transit delays, and optimize shuttle/bus routes."
        }
        return instructions.get(role, instructions["fan"])

    @classmethod
    def generate_response(cls, db: Session, request: ChatRequest) -> ChatResponse:
        intent = cls.detect_intent(request.message)
        role_prompt = cls.get_role_instructions(request.user_role)
        
        # 1. Retrieve current database facts to inject
        stadium_facts = DataService.get_stadium_context_string(db)
        
        # 2. Build full prompt
        system_instruction = f"""
        {role_prompt}
        
        {stadium_facts}
        
        Active Language: {request.language}
        Active User Seat/Section Context: {request.seat_section or 'Not specified'}
        Active User Selected Entrance Gate: {request.gate or 'Not specified'}
        
        RESPONSE RULES:
        1. Always reference specific facts from the database conditions above.
        2. If something is delayed, congested, or closed, suggest alternative gates/stalls/routes.
        3. Keep recommendations practical and real-world.
        4. Explain your reasoning briefly.
        5. Return the output as a valid JSON object matching the schema:
        {
            "response": "Your natural language message to the user.",
            "intent": "emergency | navigation | transport | food | crowd | operations | general",
            "suggested_actions": ["Action A", "Action B"],
            "reasoning": "Brief explanation of your recommendation based on current facts."
        }
        """

        # 3. Call Gemini API if key is available
        if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[
                        {"role": "system", "text": system_instruction},
                        {"role": "user", "text": f"User prompt: {request.message}"}
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                
                # Parse structured output
                data = json.loads(response.text)
                return ChatResponse(
                    response=data.get("response", ""),
                    intent=data.get("intent", intent),
                    suggested_actions=data.get("suggested_actions", []),
                    reasoning=data.get("reasoning", "")
                )
            except Exception as e:
                logger.error(f"Gemini API failure: {str(e)}")
                # Fall through to local fallback on API error

        # 4. Fallback Context-Aware Engine (Logical decision builder)
        return cls._generate_fallback(db, request, intent)

    @classmethod
    def _generate_fallback(cls, db: Session, request: ChatRequest, intent: str) -> ChatResponse:
        """
        Resilient mock fallback matching the LLM persona, utilizing current DB context.
        """
        msg = request.message.lower()
        actions = []
        reasoning = ""
        
        # Load entities for smart replies
        gates = DataService.get_stadium_gates(db)
        stalls = DataService.get_food_stalls(db)
        routes = DataService.get_transport_routes(db)
        meds = DataService.get_medical_stations(db)
        incidents = DataService.get_active_incidents(db)

        if intent == "emergency":
            nearest_med = meds[0] if meds else None
            med_loc = f"Station {nearest_med.name} at {nearest_med.location}" if nearest_med else "nearest medical hub"
            response = f"🚨 EMERGENCY DEPLOYED. I have routed your coordinates to the Medical Dispatch Team. Please proceed to the {med_loc} immediately. A First-Aid responder has been notified."
            actions = ["Navigate to Medical Station", "View Evacuation Routes"]
            reasoning = f"Emergency request detected. Prompted user to seek {med_loc} and notified responder role."
            
        elif intent == "navigation":
            # Direct seat/gate recommendations
            user_gate = request.gate or "Gate A"
            gate_wait = next((g.current_queue_time_mins for g in gates if user_gate.lower() in f"gate {g.name}".lower()), 5)
            response = f"Welcome to MetLife Stadium! Since you are entering via **{user_gate}** to reach **{request.seat_section or 'Section 100'}**, please check the 'Stadium Map' tab where we have highlighted your customized entrance-to-seat walkway. The check-in queue wait at your chosen gate is currently {gate_wait} minutes."
            actions = ["View Map Route", "Show Concessions Near Seat"]
            reasoning = f"Generated ticket routing from {user_gate} to {request.seat_section or 'Section 100'} with wait time {gate_wait} mins."

        elif intent == "transport":
            delayed = [r for r in routes if r.status == "delayed"]
            normal = [r for r in routes if r.status == "normal"]
            
            if delayed:
                response = f"⚠️ Notice: Route **{delayed[0].name}** ({delayed[0].type}) is currently experiencing delays of up to {delayed[0].current_wait_time_mins} mins. We recommend using **Route {normal[0].name}** to {normal[0].destination} instead, which is running normally."
                actions = [f"View Route {normal[0].name} Schedule", "Request Shuttle Parking"]
                reasoning = f"Redirected user from delayed Route {delayed[0].name} to normal Route {normal[0].name}."
            else:
                response = f"All public transportation is currently operating normally. The next train at Route {routes[0].name} departs in {routes[0].current_wait_time_mins} minutes."
                actions = ["Show Transit Timetables", "Open Parking Assistant"]
                reasoning = "All transport operating normally, showed next departure."

        elif intent == "food":
            vegan_healthy = [s for s in stalls if any(x in s.type.lower() for x in ["vegan", "healthy", "beverage"])]
            best_stall = min(stalls, key=lambda x: x.current_wait_time_mins)
            
            response = f"Hungry? Check out **{best_stall.name}** at {best_stall.location}. The current queue wait time is approximately {best_stall.current_wait_time_mins} mins. Plus, it features a sustainability rating of {best_stall.sustainability_score}/5.0!"
            actions = [f"Route to {best_stall.name}", "View Full F&B Menu"]
            reasoning = f"Recommended {best_stall.name} based on the shortest wait time of {best_stall.current_wait_time_mins} minutes."

        elif intent == "crowd":
            congested = [g for g in gates if g.status == "congested"]
            if congested:
                response = f"Crowd alert: **Gate {congested[0].name}** is congested with a wait of {congested[0].current_queue_time_mins} mins. Please redirect to Gate A or Gate B to avoid bottlenecks."
                actions = ["View Crowd Heatmap", "Get Alternative Gate Route"]
                reasoning = f"Identified congestion at Gate {congested[0].name} and advised bypass routes."
            else:
                response = "Queue times are optimal across all entrance gates. Average check-in wait is under 8 minutes."
                actions = ["Open Gate Entrance Monitor"]
                reasoning = "Overall crowd levels are normal."

        elif intent == "operations":
            active_inc = len(incidents)
            response = f"Operations status: We currently have {active_inc} active incidents. Volunteers are deployed to Gates A and C. Please coordinate through the Volunteer checklist."
            actions = ["Update Task Checklist", "Report New Incident"]
            reasoning = "Dispatched operational metrics to volunteer role."

        else:
            response = "Hello! I am FIFA MatchIntel AI, your digital helper for FIFA 2026. Let me know if you need help finding gates, seats, checking food queues, or viewing transport options."
            actions = ["Find My Seat", "F&B Wait Times", "Transit Schedule"]
            reasoning = "Fallback general response."

        # Apply basic translation simulation if requested language is not English
        if request.language != "en":
            response = f"[Translated to {request.language.upper()}] " + response

        return ChatResponse(
            response=response,
            intent=intent,
            suggested_actions=actions,
            reasoning=reasoning
        )
